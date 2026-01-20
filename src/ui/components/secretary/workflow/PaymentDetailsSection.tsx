import { Label } from '@/ui/components/ui/label';
import { Button } from '@/ui/components/ui/button';
import { CreditCard } from 'lucide-react';

import { ConsultationType } from '@/ui/hooks/useConsultationTypes';

interface PaymentDetailsSectionProps {
    amountToPay: number | '';
    setAmountToPay: React.Dispatch<React.SetStateAction<number | ''>>;
    originalAmount: number;
    isPartial: boolean;
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
    consultationTypes = [],
    selectedTypeId,
    setSelectedTypeId,
    isInvoiceMissing = false
}: PaymentDetailsSectionProps) {
    return (
        <div className="space-y-6">
            {/* Consultation Type Selector (Only if Invoice Missing) */}
            {isInvoiceMissing && consultationTypes.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Acte Réalisé</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {consultationTypes.map((type) => {
                            const isSelected = selectedTypeId === type.id.toString();
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedTypeId?.(type.id.toString())}
                                    className={`cursor-pointer border rounded-lg p-3 transition-all ${isSelected
                                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-medium text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                                            {type.label}
                                        </span>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className={`text-xs font-bold ${isSelected ? "text-blue-600" : "text-slate-400"}`}>
                                        {type.amount} DA
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Total Amount Card */}
            <div className="bg-slate-900 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CreditCard className="w-16 h-16 text-white" />
                </div>
                <Label className="relative z-10 uppercase text-xs font-bold text-slate-400 tracking-wider">Montant Total à Payer</Label>
                <div className="relative z-10 text-4xl font-bold text-white mt-1">
                    {originalAmount} <span className="text-lg font-medium text-slate-400">DA</span>
                </div>
            </div>

            {/* Payment Input Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <Label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Somme Reçue (Encaissement)
                </Label>

                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="number"
                            step="100"
                            value={amountToPay}
                            onChange={(e) => {
                                const val = e.target.value;
                                setAmountToPay(val === '' ? '' : Number(val));
                            }}
                            className={`w-full text-4xl font-bold py-3 bg-transparent border-b-2 outline-none transition-all placeholder:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isPartial
                                ? 'text-amber-600 border-amber-200 focus:border-amber-500'
                                : 'text-slate-900 border-slate-200 focus:border-blue-500'
                                }`}
                            placeholder="0"
                        />
                        <span className="absolute right-0 bottom-4 text-xl font-bold text-slate-400 pointer-events-none">DA</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Button
                            size="sm" variant="outline" className="flex-1 h-9 bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium text-slate-600"
                            onClick={() => setAmountToPay((prev) => (prev === '' ? 0 : Number(prev)) + 500)}
                        >
                            +500 DA
                        </Button>
                        <Button
                            size="sm" variant="outline" className="flex-1 h-9 bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium text-slate-600"
                            onClick={() => setAmountToPay((prev) => Math.max(0, (prev === '' ? 0 : Number(prev)) - 500))}
                        >
                            -500 DA
                        </Button>
                        <Button
                            size="sm" variant="outline" className="flex-1 h-9 bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 transition-all font-medium text-blue-600"
                            onClick={() => setAmountToPay(originalAmount)}
                        >
                            Tout
                        </Button>
                    </div>
                </div>

                {isPartial && (
                    <div className="animate-in fade-in slide-in-from-top-1 pt-2">
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                            <div className="mt-0.5 p-1 bg-amber-100 rounded-md shrink-0">
                                <div className="text-xs font-bold">⚠️</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-amber-900">Paiement Partiel</span>
                                <span className="text-xs text-amber-700/80">Le reste sera automatiquement marqué comme dette.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
