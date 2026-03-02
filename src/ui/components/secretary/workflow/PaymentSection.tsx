import { useState } from 'react';
import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import { CreditCard, DollarSign } from 'lucide-react';
import { usePendingPayment } from '@/ui/hooks/useWorkflow';
import { cn } from "@/ui/lib/utils";
import { SecretaryPaymentSheet } from "./SecretaryPaymentSheet";

export default function PaymentSection() {
    const pendingPayments = usePendingPayment();
    // Use the first one for direct action, or list them if we updated UI to show a list.
    // For now, let's just show the first one but indicate more.
    const activePayment = Array.isArray(pendingPayments) ? pendingPayments[0] : null;
    const queueSize = Array.isArray(pendingPayments) ? pendingPayments.length : 0;

    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <>
            <div className={cn(
                "p-3 rounded-2xl transition-all border shadow-sm group duration-300",
                activePayment
                    ? "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-amber-400 ring-4 ring-amber-500/20 shadow-lg scale-[1.02] -translate-y-0.5"
                    : "bg-white/80 border-slate-100 hover:bg-white hover:border-slate-200"
            )}>
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl transition-all relative shrink-0",
                        activePayment ? "bg-amber-500 text-white shadow-lg shadow-amber-300 animate-[pulse_2s_ease-in-out_infinite]" : "bg-slate-100 text-slate-400 w-10 h-10"
                    )}>
                        <CreditCard className={cn(
                            "transition-all",
                            activePayment ? "h-6 w-6" : "h-4 w-4"
                        )} />

                        {queueSize > 1 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                                {queueSize}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {activePayment ? (
                            <div>
                                <p className="text-base font-bold text-slate-900 truncate leading-tight">
                                    {activePayment.name} {activePayment.surname}
                                </p>
                                <p className="text-[11px] text-amber-700 font-extrabold uppercase tracking-wide mt-0.5 flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                                    </span>
                                    {queueSize > 1 ? `${queueSize} PAIEMENTS EN ATTENTE` : 'PAIEMENT REQUIS'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm font-medium text-slate-400">Paiement</p>
                                <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tight italic">Aucun en attente</p>
                            </div>
                        )}
                    </div>

                    {activePayment && (
                        <Button
                            size="sm"
                            onClick={() => setIsSheetOpen(true)}
                            className="h-9 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-md font-semibold text-xs animate-in fade-in zoom-in duration-300"
                        >
                            Encaisser <DollarSign className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    )}
                </div>
            </div>

            {activePayment && (
                <SecretaryPaymentSheet
                    isOpen={isSheetOpen}
                    onClose={() => setIsSheetOpen(false)}
                    patientId={activePayment.id}
                    appointmentId={activePayment.appointmentId}
                    waitlistId={activePayment.waitlistId}
                />
            )}
        </>
    );
}
