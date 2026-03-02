import { useState, useEffect } from 'react';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';

interface UseFinishSheetLogicProps {
    isOpen: boolean;
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
    consultationTypes,
    nextAppointmentData,
    onConfirm,
    onClose
}: UseFinishSheetLogicProps) {
    const [consultationTypeId, setConsultationTypeId] = useState<string>(consultationTypes[0]?.id.toString() || '1');
    const [amount, setAmount] = useState<number | ''>('');
    const [status, setStatus] = useState<string>('standard');
    const [isPriceModified, setIsPriceModified] = useState(false);

    // Next Appointment State
    const [nextApptDate, setNextApptDate] = useState<string>('');
    const [nextApptType, setNextApptType] = useState<string>('control');
    const [nextApptTimeframe, setNextApptTimeframe] = useState<string>('');

    // Set initial values
    useEffect(() => {
        if (isOpen) {
            // Price init
            if (!isPriceModified && consultationTypes.length > 0) {
                const typeId = parseInt(consultationTypeId);
                const type = consultationTypes.find(t => t.id === typeId);
                // Only reset amount if we found a type and price hasn't been manually modified.
                // However, initial load usually sets '1' as default.
                // If the user hasn't touched the price, update it based on type.
                if (type) setAmount(type.amount);
            }

            // Next Appointment Init
            if (nextAppointmentData) {
                if (nextAppointmentData.date) setNextApptDate(nextAppointmentData.date.split('T')[0]);
                if (nextAppointmentData.timeframe) setNextApptTimeframe(nextAppointmentData.timeframe);
                // Reason usually maps to type, but loose mapping
            }
        }
    }, [isOpen, consultationTypeId, consultationTypes, isPriceModified, nextAppointmentData]);

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
