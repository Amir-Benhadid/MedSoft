import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Separator } from '@/ui/components/ui/separator';
import { Check, CreditCard, Loader2, Wallet } from 'lucide-react';
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
            <SheetContent className="w-full sm:max-w-[540px] flex flex-col p-0 gap-0 border-l shadow-2xl">
                <SheetHeader className="px-4 py-3 border-b bg-white shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <Wallet className="w-4 h-4 text-slate-500" />
                        <span>Paiement Consultation</span>
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500 mt-1">
                        Encaissement et suivi du prochain rendez-vous.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50/50">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        <span className="text-sm font-medium">Chargement des détails...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
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

                        <Separator className="bg-slate-200" />

                        <NextAppointmentSection nextAppt={nextAppt} />
                    </div>
                )}

                <SheetFooter className="px-4 py-3 bg-white border-t shrink-0 flex gap-2">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-9 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => payMutation.mutate()}
                        disabled={isLoading || payMutation.isPending}
                        className={`flex-[2] h-9 font-semibold text-sm active:scale-[0.98] transition-all ${
                            paymentStatus === 'creance'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                        {payMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : paymentStatus === 'creance' ? (
                            <>
                                <span className="mr-1.5">⚠️</span>
                                Valider Créance
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Confirmer Paiement
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
