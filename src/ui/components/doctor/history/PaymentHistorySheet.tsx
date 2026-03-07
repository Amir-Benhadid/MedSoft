import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/ui/components/ui/sheet";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Wallet, Loader2, DollarSign } from "lucide-react";
import { orpcClient as orpc } from "@/ui/lib/orpc/client";
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/ui/lib/utils";

interface PaymentHistorySheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
}

export function PaymentHistorySheet({
    isOpen,
    onOpenChange,
    patientId,
}: PaymentHistorySheetProps) {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices', 'listByPatient', patientId],
        queryFn: async () => {
            if (!patientId) return [];
            return await orpc.invoices.listByPatientId({ patientId });
        },
        enabled: isOpen && !!patientId,
    });

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-[600px] p-0 flex flex-col gap-0 shadow-2xl">
                <SheetHeader className="px-5 py-3.5 border-b bg-white shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-base text-slate-800">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>Historique des paiements</span>
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                        Suivi détaillé des règlements et restes à payer.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
                    {/* Invoices List */}
                    <ScrollArea className="flex-1 px-4 py-3">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                                <p className="text-sm">Chargement...</p>
                            </div>
                        ) : !invoices || invoices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <DollarSign className="w-10 h-10 opacity-20 mb-3" />
                                <p className="text-sm font-medium">Aucun paiement</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {invoices.map((invoice) => {
                                    const isPaid = invoice.paid >= invoice.total;
                                    const creance = invoice.total - invoice.paid;
                                    const date = new Date(invoice.created_at);

                                    return (
                                        <div key={invoice.id} className={cn(
                                            "flex items-center justify-between px-4 py-3 rounded-xl border transition-all shadow-sm",
                                            isPaid
                                                ? "border-emerald-200 bg-emerald-50/50"
                                                : "border-red-200 bg-red-50/50"
                                        )}>
                                            <div className="flex items-center gap-4">
                                                {/* Date */}
                                                <span className="text-xs font-bold text-slate-500 tabular-nums uppercase tracking-tight">
                                                    {format(date, "d MMM yyyy", { locale: fr })}
                                                </span>

                                                <span className="text-slate-300 font-light">|</span>

                                                {/* Type - High Emphasis */}
                                                <span className={cn(
                                                    "font-black text-sm uppercase tracking-wider",
                                                    isPaid ? "text-emerald-800" : "text-red-800"
                                                )}>
                                                    {invoice.type === 'consultation' ? 'CONSULTATION' : invoice.type?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Payment Info at the end */}
                                            <div className="flex items-center gap-2">
                                                {isPaid ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest leading-none">Réglé</span>
                                                        <span className="text-base font-black text-emerald-700 leading-tight">
                                                            {invoice.total.toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] text-red-600/70 font-bold uppercase tracking-widest leading-none">Reste à payer</span>
                                                        <span className="text-base font-black text-red-700 leading-tight">
                                                            {creance.toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
