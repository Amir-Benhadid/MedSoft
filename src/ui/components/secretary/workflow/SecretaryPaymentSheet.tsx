import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useSecretaryPaymentLogic } from './useSecretaryPaymentLogic';
import { PaymentDetailsSection } from './PaymentDetailsSection';
import { NextAppointmentSection } from './NextAppointmentSection';

interface SecretaryPaymentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: string;
    appointmentId?: string;
    waitlistId?: string;
    onPaymentComplete?: () => void;
}

export function SecretaryPaymentSheet({
    isOpen,
    onClose,
    patientId,
    appointmentId,
    waitlistId,
    onPaymentComplete
}: SecretaryPaymentSheetProps) {
    const {
        amountToPay,
        setAmountToPay,
        isLoading,
        paymentStatus,
        isPartial,
        originalAmount,
        payMutation,
        nextAppt,
        consultationTypes,
        selectedTypeId,
        setSelectedTypeId,
        isInvoiceMissing
    } = useSecretaryPaymentLogic({
        patientId,
        isOpen,
        onClose,
        appointmentId,
        waitlistId,
        onPaymentComplete
    });

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-[400px] bg-white flex flex-col">
                <SheetHeader className="pb-6 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-xl text-slate-800">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Paiement Consultation
                    </SheetTitle>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto py-6 space-y-8">
                        <PaymentDetailsSection
                            amountToPay={amountToPay}
                            setAmountToPay={setAmountToPay}
                            originalAmount={originalAmount}
                            isPartial={isPartial}
                            consultationTypes={consultationTypes}
                            selectedTypeId={selectedTypeId}
                            setSelectedTypeId={setSelectedTypeId}
                            isInvoiceMissing={isInvoiceMissing}
                        />

                        <NextAppointmentSection nextAppt={nextAppt} />
                    </div>
                )}

                <SheetFooter className="pt-4 border-t shrink-0">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => payMutation.mutate()}
                        disabled={isLoading || payMutation.isPending}
                        className={`flex-[2] text-white shadow-lg transition-all ${paymentStatus === 'creance'
                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {payMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : paymentStatus === 'creance' ? (
                            <div className="flex items-center">
                                <span className="mr-2 text-lg">⚠️</span>
                                Valider Créance
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <Check className="w-4 h-4 mr-2" />
                                Confirmer Paiement
                            </div>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
