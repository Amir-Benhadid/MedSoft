import React from 'react';
import { CreditCard, Stethoscope } from 'lucide-react';
import { Label } from '@/ui/components/ui/label';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { cn } from '@/ui/lib/utils';

interface PaymentSectionProps {
    consultationTypes: ConsultationType[];
    consultationTypeId: string;
    onTypeChange: (id: string) => void;
    amount: number | '';
    onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setAmount: (val: number | '' | ((prev: number | '') => number | '')) => void;
    status: string;
    setStatus: (val: string) => void;
}

export function PaymentSection({
    consultationTypes,
    consultationTypeId,
    onTypeChange,
    amount,
    onAmountChange,
    setAmount,
    status,
    setStatus
}: PaymentSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CreditCard className="w-4 h-4" />
                </div>
                Facturation
            </div>

            <div className="bg-white p-5 rounded-xl border shadow-sm space-y-5">
                {/* Consultation Type */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Acte Réalisé</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {consultationTypes.map((type) => {
                            const isSelected = consultationTypeId === type.id.toString();
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => onTypeChange(type.id.toString())}
                                    className={cn(
                                        "cursor-pointer border rounded-lg p-3 transition-all",
                                        isSelected
                                            ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={cn("font-medium text-sm", isSelected ? "text-blue-700" : "text-slate-700")}>
                                            {type.label}
                                        </span>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                    </div>
                                    <div className={cn("text-xs font-bold", isSelected ? "text-blue-600" : "text-slate-400")}>
                                        {type.amount} DA
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Amount & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Montant Final</Label>
                        <div className="relative group">
                            <Input
                                type="number"
                                step="100"
                                value={amount}
                                onChange={onAmountChange}
                                disabled={status === 'gratuit'}
                                className="pr-12 pl-4 text-2xl font-bold h-14 bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none group-focus-within:text-blue-500">DA</span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm" variant="outline" className="h-7 text-xs px-2"
                                onClick={() => setAmount((prev) => (prev === '' ? 0 : Number(prev)) + 500)}
                                disabled={status === 'gratuit'}
                            >
                                +500
                            </Button>
                            <Button
                                size="sm" variant="outline" className="h-7 text-xs px-2"
                                onClick={() => setAmount((prev) => Math.max(0, (prev === '' ? 0 : Number(prev)) - 500))}
                                disabled={status === 'gratuit'}
                            >
                                -500
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-14 bg-slate-50 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold text-slate-900">Standard</span>
                                            <span className="text-xs text-slate-500">Encaisser le montant</span>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="gratuit" className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm">
                                            <Stethoscope className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="font-semibold text-green-900">Gratuité</span>
                                            <span className="text-xs text-green-600/80">Aucun paiement</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
