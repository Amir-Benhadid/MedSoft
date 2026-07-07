import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useToast } from "@/ui/hooks/use-toast";

import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';
import { getLocalISOString, getLocalTodayDate } from '@/ui/lib/time';

interface UseSecretaryPaymentLogicProps {
    patientId: string;
    isOpen: boolean;
    onClose: () => void;
    appointmentId?: string;
    waitlistId?: string;
    onPaymentComplete?: () => void;
}

export function useSecretaryPaymentLogic({
    patientId,
    isOpen,
    onClose,
    appointmentId,
    waitlistId,
    onPaymentComplete
}: UseSecretaryPaymentLogicProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Local State
    const [amountToPay, setAmountToPay] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [selectedTypeId, setSelectedTypeId] = useState<string>('');

    // Fetch Consultation Types
    const { data: consultationTypes = [] } = useConsultationTypes();

    // 1. Fetch latest consultation
    const { data: consultations, isLoading: isLoadingConsultations } = useQuery({
        queryKey: ['consultations', patientId],
        queryFn: () => orpcClient.consultations.listByPatient({ patientId }),
        enabled: isOpen && !!patientId,
    });

    const today = getLocalTodayDate();
    const latestConsultation = consultations?.find(c => c.date.startsWith(today)) || consultations?.[0];

    // 2. Fetch Invoice
    const { data: invoice, isLoading: isLoadingInvoice } = useQuery({
        queryKey: ['invoice', latestConsultation?.id],
        queryFn: () => orpcClient.invoices.getByConsultationId({ consultationId: latestConsultation!.id }),
        enabled: !!latestConsultation?.id,
    });

    // Initialize local state when invoice loads OR when types change
    useEffect(() => {
        if (invoice) {
            setAmountToPay(Math.max(invoice.total - invoice.paid, 0));
            if (invoice.consultation_type_id) {
                setSelectedTypeId(invoice.consultation_type_id.toString());
            }
        } else if (consultationTypes.length > 0 && !amountToPay && !selectedTypeId) {
            // Default to first type if no invoice
            const defaultType = consultationTypes.find(t => 
                t.label.toLowerCase() === 'consultation standard' || 
                t.label.toLowerCase() === 'consulatation standard'
            ) || consultationTypes[0];
            setSelectedTypeId(defaultType.id.toString());
            setAmountToPay(defaultType.amount);
        }
    }, [invoice, consultationTypes]);

    // Update amount when type changes (only if no invoice locked in, allows override)
    useEffect(() => {
        if (!invoice && selectedTypeId) {
            const type = consultationTypes.find(t => t.id.toString() === selectedTypeId);
            if (type) setAmountToPay(type.amount);
        }
    }, [selectedTypeId, invoice, consultationTypes]);

    // Derived Logic
    const currentAmount = typeof amountToPay === 'number' ? amountToPay : 0;
    const isInvoiceMissing = !invoice;
    const originalAmount = invoice ? invoice.amount : (consultationTypes.find(t => t.id.toString() === selectedTypeId)?.amount || 0);
    const previousPaid = invoice?.paid || 0;
    const totalPaidAfterPayment = Math.min(originalAmount, previousPaid + currentAmount);
    const remainingAfterPayment = Math.max(0, originalAmount - totalPaidAfterPayment);

    const isPartial = remainingAfterPayment > 0;

    const paymentStatus: 'paid' | 'creance' = isPartial ? 'creance' : 'paid';

    // 3. Mutation to Pay
    // 3. Mutation to Pay
    const payMutation = useMutation({
        mutationFn: async () => {
            const paidAmount = currentAmount;
            const paidTotal = Math.min(originalAmount, previousPaid + paidAmount);
            let targetConsultationId = latestConsultation?.id;

            // Scenario A: No Consultation exists (e.g. Secretary Mode start) -> Create One
            if (!targetConsultationId) {
                const newCons = await orpcClient.consultations.create({
                    patient_id: patientId,
                    date: getLocalISOString(),
                    status: 'completed',
                    payment: {
                        amount: originalAmount,
                        type: 'standard',
                        method: 'cash',
                        consultation_type_id: selectedTypeId ? parseInt(selectedTypeId) : undefined,
                    }
                });
                if (newCons) targetConsultationId = newCons.id;
            }
            // Scenario B: Consultation exists but No Invoice -> Update Consultation to trigger Invoice creation
            else if (!invoice) {
                await orpcClient.consultations.update({
                    id: targetConsultationId,
                    updates: {
                        patient_id: patientId, // Ensure patient_id is passed for Secretary link
                        payment: {
                            amount: originalAmount, // The total due
                            type: 'standard',
                            method: 'cash',
                            consultation_type_id: selectedTypeId ? parseInt(selectedTypeId) : undefined,
                        },
                        status: 'completed'
                    } as any
                });
            }

            // Scenario C: Invoice exists (or was just created) -> Update PAID amount
            // If invoice was just created by backend (via create/update consultation), it likely defaults 'paid' to 0.
            // So we must update it to reflect the actual 'paidAmount'.

            if (invoice) {
                await orpcClient.invoices.update({
                    id: invoice.id,
                    updates: {
                        paid: paidTotal,
                        patient_id: patientId, // Redundant but safe
                    } as any
                });
            } else if (targetConsultationId) {
                // Fetch the newly created invoice
                try {
                    const newInvoice = await orpcClient.invoices.getByConsultationId({ consultationId: targetConsultationId });
                    if (newInvoice) {
                        await orpcClient.invoices.update({
                            id: newInvoice.id,
                            updates: {
                                paid: paidTotal,
                                patient_id: patientId, // Vital for linking in Secretary Mode
                            } as any
                        });
                    }
                } catch (e) {
                    console.error("Failed to update new invoice payment status", e);
                }
            }

            // Update Appointment/Waitlist Status
            if (appointmentId) {
                await orpcClient.appointments.update({
                    id: appointmentId,
                    updates: {
                        state: paymentStatus,
                    }
                });
            } else if (waitlistId) {
                await orpcClient.waitlist.updateStatus({
                    id: waitlistId,
                    state: paymentStatus
                });
            }
        },
        onSuccess: () => {
            toast({ title: "Paiement Enregistré", description: `Statut: ${paymentStatus === 'creance' ? 'Créance (Partiel)' : 'Payé'}` });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            queryClient.invalidateQueries({ queryKey: ['resume'] });
            if (onPaymentComplete) onPaymentComplete();
            onClose();
        },
        onError: (err) => {
            console.error(err);
            toast({ title: "Erreur", description: "Échec du paiement.", variant: "destructive" });
        }
    });

    return {
        latestConsultation,
        invoice,
        amountToPay,
        setAmountToPay,
        notes,
        setNotes,
        isLoading: isLoadingConsultations || isLoadingInvoice,
        paymentStatus,
        isPartial,
        originalAmount,
        previousPaid,
        remainingAfterPayment,
        payMutation,
        nextAppt: latestConsultation?.clinical_exam?.nextAppointment,
        consultationTypes,
        selectedTypeId,
        setSelectedTypeId,
        isInvoiceMissing
    };
}
