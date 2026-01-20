import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Check } from 'lucide-react';
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
            <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto bg-slate-50 flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 bg-white border-b shrink-0">
                    <SheetTitle className="flex items-center gap-3 text-2xl text-slate-800">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Check className="w-6 h-6 text-blue-600" />
                        </div>
                        Fin de Consultation
                    </SheetTitle>
                    <p className="text-sm text-slate-500 font-medium ml-11">
                        Validez les détails du paiement et le prochain rendez-vous.
                    </p>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Next Appointment Section */}
                    <NextAppointmentSection
                        nextApptType={nextApptType}
                        setNextApptType={setNextApptType}
                        nextApptDate={nextApptDate}
                        setNextApptDate={setNextApptDate}
                        nextApptTimeframe={nextApptTimeframe}
                        setNextApptTimeframe={setNextApptTimeframe}
                    />

                    {/* Payment Section */}
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

                <SheetFooter className="p-6 bg-white border-t shrink-0 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-12 text-slate-600 border-slate-300 hover:bg-slate-50">
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm} className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 text-lg font-medium">
                        <Check className="w-5 h-5 mr-2" />
                        Terminer
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
