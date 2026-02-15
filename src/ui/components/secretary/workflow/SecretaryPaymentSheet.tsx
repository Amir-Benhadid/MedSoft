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
            <SheetContent className="w-full sm:max-w-[540px] flex flex-col p-0 gap-0 border-l bg-slate-50/80">
                <SheetHeader className="px-6 py-5 bg-gradient-to-r from-blue-50 via-indigo-50/80 to-blue-50 border-b shrink-0">
                    <SheetTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-200/60">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        Paiement Consultation
                    </SheetTitle>
                    <SheetDescription className="text-sm text-slate-500 font-medium ml-[52px]">
                        Encaissement et suivi du prochain rendez-vous.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Chargement des détails...</span>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

                        <Separator className="bg-slate-200/80" />

                        <NextAppointmentSection nextAppt={nextAppt} />
                    </div>
                )}

                <SheetFooter className="px-6 py-4 bg-white border-t shrink-0 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-11 text-slate-600 border-slate-200 hover:bg-slate-50 font-medium">
                        Annuler
                    </Button>
                    <Button
                        onClick={() => payMutation.mutate()}
                        disabled={isLoading || payMutation.isPending}
                        className={`flex-[2] h-11 text-white shadow-lg transition-all font-semibold text-base active:scale-[0.98] ${paymentStatus === 'creance'
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/25'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                            }`}
                    >
                        {payMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : paymentStatus === 'creance' ? (
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                Valider Créance
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Confirmer Paiement
                            </div>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
