import { Button } from "@/ui/components/ui/button";
import { CreditCard, ArrowRight, DollarSign } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { SecretaryPaymentSheet } from "./SecretaryPaymentSheet";
import { useState } from "react";

interface PaymentActionHeaderProps {
    payment: {
        id: string;
        name: string;
        surname: string;
        appointmentId?: string;
        waitlistId?: string;
    };
    queueSize?: number;
}

export default function PaymentActionHeader({ payment, queueSize = 1 }: PaymentActionHeaderProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <>
            <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-900 uppercase tracking-wide">
                                Paiement Requis
                            </h3>
                            <p className="text-lg font-bold text-slate-900 leading-tight">
                                {payment.name} {payment.surname}
                            </p>
                        </div>
                    </div>
                    {queueSize > 1 && (
                        <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            +{queueSize - 1} autres
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm h-10"
                >
                    Encaisser
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <SecretaryPaymentSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                patientId={payment.id}
                appointmentId={payment.appointmentId}
                waitlistId={payment.waitlistId}
            />
        </>
    );
}
