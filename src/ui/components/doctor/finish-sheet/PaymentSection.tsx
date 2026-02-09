import React from 'react';
import { CreditCard, Stethoscope, Check, Wallet, Banknote } from 'lucide-react';
import { Label } from '@/ui/components/ui/label';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { ConsultationType } from '@/ui/hooks/useConsultationTypes';
import { cn } from '@/ui/lib/utils';
import { Badge } from '@/ui/components/ui/badge';

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
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200 flex items-center justify-center text-white">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Facturation & Paiement</h2>
                    <p className="text-xs text-slate-500 font-medium">Gestion des honoraires de la consultation</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section: Type de Consultation */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block">
                        Type de Consultation
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {consultationTypes.map((type) => {
                            const isSelected = consultationTypeId === type.id.toString();
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => onTypeChange(type.id.toString())}
                                    className={cn(
                                        "relative group flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                                        isSelected
                                            ? "bg-white border-blue-500 shadow-md shadow-blue-100"
                                            : "bg-white border-transparent shadow-sm hover:border-slate-300 hover:shadow-md"
                                    )}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className={cn(
                                            "font-bold text-sm transition-colors",
                                            isSelected ? "text-blue-700" : "text-slate-700"
                                        )}>
                                            {type.label}
                                        </span>
                                        <span className={cn(
                                            "text-xs font-medium transition-colors",
                                            isSelected ? "text-blue-500" : "text-slate-400"
                                        )}>
                                            Tarif recommandé
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge variant="secondary" className={cn(
                                            "font-bold transition-colors",
                                            isSelected ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {type.amount} DA
                                        </Badge>
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 p-1.5 bg-blue-500 rounded-bl-xl rounded-tr-lg shadow-sm">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section: Détails du Paiement */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Colonne Gauche: Montant */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Montant à Encaisser
                            </Label>
                            {status === 'gratuit' && (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    Gratuité Appliquée
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Banknote className={cn("w-5 h-5 transition-colors", status === 'gratuit' ? "text-slate-300" : "text-slate-400 group-focus-within:text-blue-500")} />
                            </div>
                            <Input
                                type="number"
                                step="100"
                                value={amount}
                                onChange={onAmountChange}
                                disabled={status === 'gratuit'}
                                className={cn(
                                    "pl-12 pr-16 h-16 text-3xl font-black tracking-tight border-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-xl",
                                    status === 'gratuit'
                                        ? "bg-slate-50 border-slate-200 text-slate-400"
                                        : "bg-white border-slate-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-50 text-slate-800"
                                )}
                                placeholder="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                <span className={cn("text-lg font-bold", status === 'gratuit' ? "text-slate-300" : "text-slate-400")}>DZD</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[500, 1000, 2000].map((val) => (
                                <Button
                                    key={val}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAmount((prev) => (prev === '' ? 0 : Number(prev)) + val)}
                                    disabled={status === 'gratuit'}
                                    className="h-9 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 active:scale-95 transition-all"
                                >
                                    +{val}
                                </Button>
                            ))}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setAmount((prev) => Math.max(0, (prev === '' ? 0 : Number(prev)) - 500))}
                                disabled={status === 'gratuit'}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                            >
                                -500 Correction
                            </Button>
                        </div>
                    </div>

                    {/* Colonne Droite: Statut */}
                    <div className="space-y-4">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                            Statut du Paiement
                        </Label>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={() => setStatus('standard')}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                                    status === 'standard'
                                        ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500/20"
                                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    status === 'standard' ? "bg-blue-500 text-white shadow-md shadow-blue-200" : "bg-slate-100 text-slate-400"
                                )}>
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("font-bold text-sm", status === 'standard' ? "text-blue-900" : "text-slate-700")}>
                                        Paiement Standard
                                    </span>
                                    <span className={cn("text-xs", status === 'standard' ? "text-blue-600" : "text-slate-400")}>
                                        Encaisser le montant indiqué
                                    </span>
                                </div>
                                {status === 'standard' && <div className="ml-auto w-3 h-3 rounded-full bg-blue-500" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStatus('gratuit');
                                    setAmount(0); // Optional: reset amount or keep it for records? Typically gratuit means 0.
                                }}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all active:scale-[0.98]",
                                    status === 'gratuit'
                                        ? "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20"
                                        : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    status === 'gratuit' ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-slate-100 text-slate-400"
                                )}>
                                    <Stethoscope className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("font-bold text-sm", status === 'gratuit' ? "text-emerald-900" : "text-slate-700")}>
                                        Acte Gratuit
                                    </span>
                                    <span className={cn("text-xs", status === 'gratuit' ? "text-emerald-600" : "text-slate-400")}>
                                        Aucun encaissement requis
                                    </span>
                                </div>
                                {status === 'gratuit' && <div className="ml-auto w-3 h-3 rounded-full bg-emerald-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
