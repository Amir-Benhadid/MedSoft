import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { orpcClient } from '@/ui/lib/orpc/client';

interface UseFinishSheetLogicProps {
    isOpen: boolean;
    consultationId?: string;
    consultationStatus?: string;
    consultationTypes: ConsultationType[];
    nextAppointmentData?: {
        date?: string;
        timeframe?: string;
        reason?: string;
    };
    onConfirm: (data: any) => void;
    onClose: () => void;
}

export function useFinishSheetLogic({
    isOpen,
    consultationId,
    consultationStatus,
    consultationTypes,
    nextAppointmentData,
    onConfirm,
    onClose
}: UseFinishSheetLogicProps) {
    const standardType = consultationTypes.find(t => 
        t.label.toLowerCase() === 'consultation standard' || 
        t.label.toLowerCase() === 'consulatation standard'
    ) || consultationTypes[0];
    const defaultNextApptType = standardType?.label || '';
    const [consultationTypeId, setConsultationTypeId] = useState<string>(standardType?.id.toString() || '1');
    const [amount, setAmount] = useState<number | ''>('');
    const [status, setStatus] = useState<string | null>(null);
    const [isPriceModified, setIsPriceModified] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Next Appointment State
    const [nextApptDate, setNextApptDate] = useState<string>('');
    const [nextApptType, setNextApptType] = useState<string>(defaultNextApptType);
    const [nextApptTimeframe, setNextApptTimeframe] = useState<string>('');

    const { data: invoice, isSuccess, isError } = useQuery({
        queryKey: ['invoice', consultationId],
        queryFn: () => orpcClient.invoices.getByConsultationId({ consultationId: consultationId! }),
        enabled: isOpen && !!consultationId,
    });

    // Reset initialization guard when sheet is closed
    useEffect(() => {
        if (!isOpen) {
            setHasInitialized(false);
        }
    }, [isOpen]);

    // Set initial values
    useEffect(() => {
        if (isOpen && !hasInitialized) {
            // We are ready to initialize if there is no consultation ID, or if the query has finished (success or error)
            const queryFinished = !consultationId || isSuccess || isError;

            if (queryFinished) {
                if (invoice && consultationStatus === 'completed') {
                    if (invoice.consultation_type_id) {
                        setConsultationTypeId(invoice.consultation_type_id.toString());
                    }
                    setAmount(invoice.amount);
                    setStatus(invoice.type === 'gratuit' || invoice.amount === 0 ? 'gratuit' : 'standard');
                } else {
                    setStatus(null);
                    setAmount('');
                    if (invoice && invoice.consultation_type_id) {
                        setConsultationTypeId(invoice.consultation_type_id.toString());
                    }
                }
                setHasInitialized(true);
                setIsPriceModified(false);
            }

            if (nextAppointmentData) {
                if (nextAppointmentData.date) setNextApptDate(nextAppointmentData.date.split('T')[0]);
                if (nextAppointmentData.timeframe) setNextApptTimeframe(nextAppointmentData.timeframe);
                setNextApptType(nextAppointmentData.reason || defaultNextApptType);
            } else {
                setNextApptType(defaultNextApptType);
            }
        }
    }, [isOpen, invoice, isSuccess, isError, consultationId, consultationStatus, hasInitialized, nextAppointmentData, defaultNextApptType]);

    const handleTypeChange = (value: string) => {
        setConsultationTypeId(value);
        const type = consultationTypes.find(t => t.id === parseInt(value));
        if (type) {
            if (status === 'standard') {
                setAmount(type.amount);
                setIsPriceModified(false);
            } else if (status === 'gratuit') {
                setAmount(0);
                setIsPriceModified(false);
            }
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setAmount('');
            setIsPriceModified(true);
            return;
        }
        const parsed = parseFloat(val);
        setAmount(isNaN(parsed) ? '' : parsed);
        setIsPriceModified(true);
    };

    const handleConfirm = () => {
        const finalAmount = amount === '' ? 0 : amount;
        onConfirm({
            consultationType: parseInt(consultationTypeId),
            amount: status === 'gratuit' ? 0 : finalAmount,
            status,
            isGratuit: status === 'gratuit',
            nextAppointment: (nextApptDate || nextApptTimeframe) ? {
                date: nextApptDate ? new Date(nextApptDate).toISOString() : '',
                timeframe: nextApptTimeframe,
                reason: nextApptType
            } : undefined
        });
        onClose();
    };

    return {
        consultationTypeId,
        handleTypeChange,
        amount,
        handleAmountChange,
        setAmount,
        status,
        setStatus,
        nextApptDate,
        setNextApptDate,
        nextApptType,
        setNextApptType,
        nextApptTimeframe,
        setNextApptTimeframe,
        handleConfirm
    };
}
