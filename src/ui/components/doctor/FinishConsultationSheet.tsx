import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Separator } from '@/ui/components/ui/separator';
import { Check, ClipboardCheck } from 'lucide-react';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { NextAppointmentSection } from './finish-sheet/NextAppointmentSection';
import { PaymentSection } from './finish-sheet/PaymentSection';
import { useFinishSheetLogic } from './finish-sheet/useFinishSheetLogic';
import { PatientDebtSummary } from '@/ui/components/shared/billing/PatientDebtSummary';

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
    consultationId?: string;
    consultationStatus?: string;
}

export function FinishConsultationSheet({
    isOpen,
    onClose,
    onConfirm,
    consultationTypes,
    nextAppointmentData,
    patientId,
    consultationId,
    consultationStatus
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
        consultationId,
        consultationStatus,
        consultationTypes,
        nextAppointmentData,
        onConfirm,
        onClose
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-[620px] overflow-y-auto flex flex-col p-0 gap-0 border-l shadow-2xl">
                <SheetHeader className="px-4 py-3 border-b bg-white shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <ClipboardCheck className="w-4 h-4 text-slate-500" />
                        <span>Fin de Consultation</span>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500 mt-1">
                        Validez les détails du paiement et le prochain rendez-vous.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    <PatientDebtSummary
                        patientId={patientId}
                        excludeConsultationId={consultationId}
                        emptyLabel="Aucune creance precedente pour ce patient."
                        variant="prominent"
                    />

                    <NextAppointmentSection
                        consultationTypes={consultationTypes}
                        nextApptType={nextApptType}
                        setNextApptType={setNextApptType}
                        nextApptDate={nextApptDate}
                        setNextApptDate={setNextApptDate}
                        nextApptTimeframe={nextApptTimeframe}
                        setNextApptTimeframe={setNextApptTimeframe}
                    />

                    <Separator className="bg-slate-200" />

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

                <SheetFooter className="px-4 py-3 bg-white border-t shrink-0 flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm} disabled={!status} className="flex-[2] h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all active:scale-[0.98]">
                        <Check className="w-4 h-4 mr-2" />
                        Terminer la Consultation
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
