import React from 'react';
import { CreditCard, Stethoscope, Check, Wallet, Banknote } from 'lucide-react';
import { Label } from '@/ui/components/ui/label';
import { Input } from '@/ui/components/ui/input';
import { Button } from '@/ui/components/ui/button';
import { Card } from '@/ui/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
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
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200/60 flex items-center justify-center text-white">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Facturation & Paiement</h2>
                    <p className="text-xs text-slate-500 font-medium">Gestion des honoraires de la consultation</p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border border-slate-200 rounded-xl">
                {/* Section: Type de Consultation */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 block">
                        Type de Consultation
                    </Label>
                    <Select value={consultationTypeId} onValueChange={onTypeChange}>
                        <SelectTrigger className="w-full bg-white border-slate-200">
                            <SelectValue placeholder="Sélectionner un type de consultation" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {consultationTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    <span className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700">{type.label}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-500">
                                            {type.amount} DA
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Section: Détails du Paiement */}
                <div className="p-4 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* Colonne Gauche: Montant */}
                    <div className="flex-1 w-full space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Montant à Encaisser
                            </Label>
                            {status === 'gratuit' && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded">
                                    Gratuité Actée
                                </Badge>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Banknote className={cn("w-4 h-4 transition-colors", status === 'gratuit' ? "text-slate-300" : "text-slate-400 group-focus-within:text-blue-500")} />
                            </div>
                            <Input
                                type="number"
                                step="100"
                                value={amount}
                                onChange={onAmountChange}
                                disabled={status === 'gratuit'}
                                className={cn(
                                    "pl-10 pr-12 h-11 text-xl font-bold tracking-tight border transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg",
                                    status === 'gratuit'
                                        ? "bg-slate-50/80 border-slate-200/80 text-slate-400 opacity-80"
                                        : "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 shadow-sm"
                                )}
                                placeholder="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className={cn("text-xs font-bold", status === 'gratuit' ? "text-slate-300" : "text-slate-400")}>DZD</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAmount((prev) => Math.max(0, (prev === '' ? 0 : Number(prev)) - 500))}
                                disabled={status === 'gratuit'}
                                className="h-8 text-[11px] font-medium text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 focus:ring-2 focus:ring-red-100 transition-colors shadow-sm"
                            >
                                -500 DZD
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setAmount((prev) => (prev === '' ? 0 : Number(prev)) + 500)}
                                disabled={status === 'gratuit'}
                                className="h-8 text-[11px] font-medium text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-100 transition-colors shadow-sm"
                            >
                                +500 DZD
                            </Button>
                        </div>
                    </div>

                    {/* Ligne séparatrice sur desktop */}
                    <div className="hidden md:block w-px h-28 bg-slate-100 mt-2 self-stretch" />

                    {/* Colonne Droite: Statut */}
                    <div className="w-full md:w-[220px] shrink-0 space-y-3">
                        <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Statut du Paiement
                        </Label>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => setStatus('standard')}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all group",
                                    status === 'standard'
                                        ? "bg-blue-50/80 border-blue-500/50 ring-1 ring-blue-500/50 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    status === 'standard' ? "bg-blue-500 text-white shadow-sm shadow-blue-200" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                                )}>
                                    <CreditCard className="w-3.5 h-3.5" />
                                </div>
                                <span className={cn(
                                    "font-semibold text-sm transition-colors",
                                    status === 'standard' ? "text-blue-900" : "text-slate-600 group-hover:text-slate-800"
                                )}>
                                    Standard
                                </span>
                                {status === 'standard' && <Check className="w-3.5 h-3.5 text-blue-500 ml-auto" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStatus('gratuit');
                                    setAmount(0);
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all group",
                                    status === 'gratuit'
                                        ? "bg-emerald-50/80 border-emerald-500/50 ring-1 ring-emerald-500/50 shadow-sm"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-md transition-colors",
                                    status === 'gratuit' ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-500"
                                )}>
                                    <Stethoscope className="w-3.5 h-3.5" />
                                </div>
                                <span className={cn(
                                    "font-semibold text-sm transition-colors",
                                    status === 'gratuit' ? "text-emerald-900" : "text-slate-600 group-hover:text-slate-800"
                                )}>
                                    Acte Gratuit
                                </span>
                                {status === 'gratuit' && <Check className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
