import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { orpcClient } from '@/ui/lib/orpc/client';

interface UseFinishSheetLogicProps {
    isOpen: boolean;
    consultationId?: string;
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
    consultationTypes,
    nextAppointmentData,
    onConfirm,
    onClose
}: UseFinishSheetLogicProps) {
    const defaultNextApptType = consultationTypes[0]?.label || '';
    const [consultationTypeId, setConsultationTypeId] = useState<string>(consultationTypes[0]?.id.toString() || '1');
    const [amount, setAmount] = useState<number | ''>('');
    const [status, setStatus] = useState<string>('standard');
    const [isPriceModified, setIsPriceModified] = useState(false);

    // Next Appointment State
    const [nextApptDate, setNextApptDate] = useState<string>('');
    const [nextApptType, setNextApptType] = useState<string>(defaultNextApptType);
    const [nextApptTimeframe, setNextApptTimeframe] = useState<string>('');

    const { data: invoice } = useQuery({
        queryKey: ['invoice', consultationId],
        queryFn: () => orpcClient.invoices.getByConsultationId({ consultationId: consultationId! }),
        enabled: isOpen && !!consultationId,
    });

    // Set initial values
    useEffect(() => {
        if (isOpen) {
            if (invoice) {
                if (invoice.consultation_type_id) {
                    setConsultationTypeId(invoice.consultation_type_id.toString());
                }
                setAmount(invoice.amount);
                setStatus(invoice.type === 'gratuit' || invoice.amount === 0 ? 'gratuit' : 'standard');
                setIsPriceModified(false);
            } else if (!isPriceModified && consultationTypes.length > 0) {
                const typeId = parseInt(consultationTypeId);
                const type = consultationTypes.find(t => t.id === typeId) || consultationTypes[0];
                if (type) {
                    setConsultationTypeId(type.id.toString());
                    setAmount(type.amount);
                }
            }

            if (nextAppointmentData) {
                if (nextAppointmentData.date) setNextApptDate(nextAppointmentData.date.split('T')[0]);
                if (nextAppointmentData.timeframe) setNextApptTimeframe(nextAppointmentData.timeframe);
                setNextApptType(nextAppointmentData.reason || defaultNextApptType);
            } else {
                setNextApptType(defaultNextApptType);
            }
        }
    }, [isOpen, consultationTypeId, consultationTypes, invoice, isPriceModified, nextAppointmentData, defaultNextApptType]);

    const handleTypeChange = (value: string) => {
        setConsultationTypeId(value);
        const type = consultationTypes.find(t => t.id === parseInt(value));
        if (type) {
            setAmount(type.amount);
            setIsPriceModified(false);
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
