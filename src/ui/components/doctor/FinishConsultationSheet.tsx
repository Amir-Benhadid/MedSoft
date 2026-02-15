import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Separator } from '@/ui/components/ui/separator';
import { Check, ClipboardCheck } from 'lucide-react';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { NextAppointmentSection } from './finish-sheet/NextAppointmentSection';
import { PaymentSection } from './finish-sheet/PaymentSection';
import { useFinishSheetLogic } from './finish-sheet/useFinishSheetLogic';

interface FinishConsultationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (paymentData: {
        consultationType: number;
        amount: number;
        status: string;
        isGratuit: boolean;
        nextAppointment?: {
            date: string;
            timeframe: string;
            reason: string;
        };
    }) => void;
    consultationTypes: ConsultationType[];
    nextAppointmentData?: {
        date?: string;
        timeframe?: string;
        reason?: string;
    };
    patientId?: string;
}

export function FinishConsultationSheet({
    isOpen,
    onClose,
    onConfirm,
    consultationTypes,
    nextAppointmentData,
    patientId
}: FinishConsultationSheetProps) {
    const {
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
    } = useFinishSheetLogic({
        isOpen,
        consultationTypes,
        nextAppointmentData,
        onConfirm,
        onClose
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-[620px] overflow-y-auto flex flex-col p-0 gap-0 border-l bg-slate-50/80">
                <SheetHeader className="px-6 py-5 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200/60">
                            <ClipboardCheck className="w-5 h-5 text-white" />
                        </div>
                        Fin de Consultation
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500 font-medium ml-[52px]">
                        Validez les détails du paiement et le prochain rendez-vous.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <NextAppointmentSection
                        nextApptType={nextApptType}
                        setNextApptType={setNextApptType}
                        nextApptDate={nextApptDate}
                        setNextApptDate={setNextApptDate}
                        nextApptTimeframe={nextApptTimeframe}
                        setNextApptTimeframe={setNextApptTimeframe}
                    />

                    <Separator className="bg-slate-200/80" />

                    <PaymentSection
                        consultationTypes={consultationTypes}
                        consultationTypeId={consultationTypeId}
                        onTypeChange={handleTypeChange}
                        amount={amount}
                        onAmountChange={handleAmountChange}
                        setAmount={setAmount}
                        status={status}
                        setStatus={setStatus}
                    />
                </div>

                <SheetFooter className="px-6 py-4 bg-white border-t shrink-0 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm} className="flex-[2] h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 text-base font-semibold transition-all active:scale-[0.98]">
                        <Check className="w-5 h-5 mr-2" />
                        Terminer la Consultation
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
