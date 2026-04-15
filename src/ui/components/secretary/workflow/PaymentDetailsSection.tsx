import { Label } from '@/ui/components/ui/label';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Check, CreditCard, Banknote } from 'lucide-react';
import { cn } from '@/ui/lib/utils';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';

interface PaymentDetailsSectionProps {
    amountToPay: number | '';
    setAmountToPay: React.Dispatch<React.SetStateAction<number | ''>>;
    originalAmount: number;
    isPartial: boolean;
    previousPaid?: number;
    remainingAfterPayment?: number;
    consultationTypes?: ConsultationType[];
    selectedTypeId?: string;
    setSelectedTypeId?: (id: string) => void;
    isInvoiceMissing?: boolean;
}

export function PaymentDetailsSection({
    amountToPay,
    setAmountToPay,
    originalAmount,
    isPartial,
    previousPaid = 0,
    remainingAfterPayment = 0,
    consultationTypes = [],
    selectedTypeId,
    setSelectedTypeId,
    isInvoiceMissing = false
}: PaymentDetailsSectionProps) {
    return (
        <div className="space-y-5">
            {/* Consultation Type Selector (Only if Invoice Missing) */}
            {isInvoiceMissing && consultationTypes.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acte Réalisé</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {consultationTypes.map((type) => {
                            const isSelected = selectedTypeId === type.id.toString();
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedTypeId?.(type.id.toString())}
                                    className={cn(
                                        "relative cursor-pointer border-2 rounded-xl p-3 transition-all text-left outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-[0.98]",
                                        isSelected
                                            ? "bg-blue-50/80 border-blue-500 shadow-sm shadow-blue-100"
                                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isSelected ? "text-blue-700" : "text-slate-700"
                                        )}>
                                            {type.label}
                                        </span>
                                        {isSelected && (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant="secondary" className={cn(
                                        "text-xs font-bold",
                                        isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {type.amount} DA
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Total Amount Card */}
            <Card className="p-0 overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-[0.06]">
                        <CreditCard className="w-20 h-20 text-white" />
                    </div>
                    <Label className="relative z-10 uppercase text-[10px] font-bold text-slate-400 tracking-widest">Montant Total à Payer</Label>
                    <div className="relative z-10 text-4xl font-black text-white mt-1.5 tracking-tight">
                        {originalAmount} <span className="text-lg font-medium text-slate-400">DA</span>
                    </div>
                </div>
            </Card>

            {/* Payment Input Card */}
            <Card className="p-5 shadow-sm border-slate-200 space-y-4">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Somme Reçue (Encaissement)
                </Label>

                <div className="space-y-3">
                    {previousPaid > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            Deja encaisse: <span className="font-semibold text-slate-800">{previousPaid} DA</span>
                        </div>
                    )}

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Banknote className={cn(
                                "w-5 h-5 transition-colors",
                                isPartial ? "text-amber-400" : "text-slate-400 group-focus-within:text-blue-500"
                            )} />
                        </div>
                        <Input
                            type="number"
                            step="100"
                            value={amountToPay}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAmountToPay(val === '' ? '' : Number(val));
                            }}
                            className={cn(
                                "pl-12 pr-14 h-14 text-3xl font-black tracking-tight border-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-xl",
                                isPartial
                                    ? 'text-amber-600 border-amber-200 focus:border-amber-500 focus:shadow-md focus:shadow-amber-50'
                                    : 'text-slate-800 border-slate-200 focus:border-blue-500 focus:shadow-md focus:shadow-blue-50'
                            )}
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">DA</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-1.5">
                        <Button
                            size="sm" variant="outline" className="h-9 bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-semibold text-slate-600 active:scale-[0.97]"
                            onClick={() => setAmountToPay((prev) => (prev === '' ? 0 : Number(prev)) + 500)}
                        >
                            +500 DA
                        </Button>
                        <Button
                            size="sm" variant="outline" className="h-9 bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-semibold text-slate-600 active:scale-[0.97]"
                            onClick={() => setAmountToPay((prev) => Math.max(0, (prev === '' ? 0 : Number(prev)) - 500))}
                        >
                            -500 DA
                        </Button>
                        <Button
                            size="sm" variant="outline" className="h-9 bg-blue-50/80 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all font-semibold text-blue-600 active:scale-[0.97]"
                            onClick={() => setAmountToPay(originalAmount)}
                        >
                            Tout
                        </Button>
                    </div>
                </div>

                {isPartial && (
                    <div className="animate-in fade-in slide-in-from-top-1 pt-1">
                        <Card className="p-3 bg-amber-50 border-amber-100 shadow-none">
                            <div className="flex items-start gap-2.5 text-amber-800">
                                <div className="mt-0.5 p-1 bg-amber-100 rounded-md shrink-0">
                                    <span className="text-xs font-bold">⚠️</span>
                                </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-bold text-amber-900">Paiement Partiel</span>
                                     <span className="text-xs text-amber-700/80">Reste apres encaissement: {remainingAfterPayment} DA.</span>
                                 </div>
                             </div>
                         </Card>
                    </div>
                )}
            </Card>
        </div>
    );
}
