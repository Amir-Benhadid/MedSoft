import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { orpcClient } from '@/ui/lib/orpc/client';
import { cn } from '@/ui/lib/utils';

interface PatientDebtSummaryProps {
    patientId?: string;
    excludeConsultationId?: string;
    className?: string;
    emptyLabel?: string;
    variant?: 'default' | 'prominent';
}

export function PatientDebtSummary({
    patientId,
    excludeConsultationId,
    className,
    emptyLabel = 'Aucune creance precedente.',
    variant = 'default',
}: PatientDebtSummaryProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['invoices', 'outstanding-summary', patientId, excludeConsultationId],
        queryFn: () => orpcClient.invoices.getOutstandingSummary({
            patientId: patientId!,
            excludeConsultationId,
        }),
        enabled: !!patientId,
    });

    if (!patientId) return null;

    if (isLoading) {
        return (
            <div className={cn(
                variant === 'prominent'
                    ? 'rounded-2xl border-2 border-slate-300 bg-slate-100 px-4 py-4 text-sm font-medium text-slate-600 shadow-sm'
                    : 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500',
                className
            )}>
                Verification des creances...
            </div>
        );
    }

    if (!data || data.totalOutstanding <= 0) {
        return (
            <div className={cn(
                variant === 'prominent'
                    ? 'rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-4 text-sm text-emerald-800 shadow-sm'
                    : 'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700',
                className
            )}>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className={cn('shrink-0', variant === 'prominent' ? 'h-5 w-5' : 'h-4 w-4')} />
                    <span>{emptyLabel}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            variant === 'prominent'
                ? 'rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 px-4 py-4 text-amber-950 shadow-md'
                : 'rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900',
            className
        )}>
            <div className={cn('flex items-center gap-2 font-semibold', variant === 'prominent' ? 'text-base' : '')}>
                <AlertTriangle className={cn('shrink-0', variant === 'prominent' ? 'h-5 w-5 text-amber-600' : 'h-4 w-4')} />
                <span className={cn(variant === 'prominent' ? 'font-bold tracking-tight' : '')}>
                    Creances precedentes: {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(data.totalOutstanding)} DA
                </span>
            </div>
            <div className={cn('mt-1 text-amber-800/80', variant === 'prominent' ? 'text-sm font-medium' : 'text-[11px]')}>
                {data.invoiceCount} recette{data.invoiceCount > 1 ? 's' : ''} non soldee{data.invoiceCount > 1 ? 's' : ''}.
            </div>
        </div>
    );
}
