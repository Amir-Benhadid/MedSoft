import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Users, CreditCard, Loader2 } from 'lucide-react';
import { getLocalISOString, getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';

interface DailyResumeProps {
    date?: Date;
    title?: string;
}

export function DailyResume({ date, title }: DailyResumeProps) {
    const targetDate = date || new Date();
    const dateStr = date ? getLocalISOString(date).slice(0, 10) : getLocalTodayDate();

    // Ensure we query the full day range (00:00:00 to 23:59:59)
    // The backend getStats method appends T00:00:00 / T23:59:59 itself, 
    // so we should pass the date string directly (YYYY-MM-DD).
    // const range = getDayRangeEncoded(dateStr); 

    const { data, isLoading } = useQuery({
        queryKey: ['resume', 'daily', dateStr],
        queryFn: () => orpcClient.stats.getStats({ startDate: dateStr, endDate: dateStr }),
    });

    if (isLoading) {
        return <div className="flex h-full items-center justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;
    }

    if (!data) return <div className="p-4 text-red-500">Erreur de chargement des données.</div>;

    const summary = data.summary;
    const consultations = data.consultations;

    // Use provided title or default based on date
    const displayTitle = title || (
        date
            ? `Résumé du ${targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
            : "Résumé du jour"
    );

    return (
        <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Consultations - Blue like RDV */}
                <div className="flex flex-col p-5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-blue-500/10">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 opacity-80">Total Consultations</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold text-blue-600 tracking-tight">{summary.consultationCount}</span>
                        <span className="text-sm text-slate-500 font-medium">patients</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Patients vus ce jour</p>
                </div>

                {/* Montant Dû - Slate/Gray */}
                <div className="flex flex-col p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-500/10">
                            <CreditCard className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600 opacity-80">Montant Dû</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-700 tracking-tight">
                            {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(summary.totalDue)}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">DA</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Valeur totale des consultations</p>
                </div>

                {/* Total Encaissé - Emerald like Consult */}
                <div className="flex flex-col p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10">
                            <CreditCard className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 opacity-80">Total Encaissé</p>
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">
                            {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(summary.income)}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">DA</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Montant réellement perçu</p>
                </div>
            </div>

            {/* Consultations Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-base font-bold text-slate-900">Détail des Consultations</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Liste complète des patients vus aujourd'hui</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold text-left">Heure</th>
                                <th className="px-6 py-3 font-bold text-left">Patient</th>
                                <th className="px-6 py-3 font-bold text-left">Type</th>
                                <th className="px-6 py-3 font-bold text-right">Montant Dû</th>
                                <th className="px-6 py-3 font-bold text-right">Payé</th>
                                <th className="px-6 py-3 font-bold text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {consultations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Users className="h-8 w-8 opacity-20" />
                                            <p className="text-sm font-medium">Aucune consultation enregistrée pour ce jour</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                consultations.map((c) => {
                                    const time = new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    const isPaid = c.paid >= c.amount;
                                    const isPartial = c.paid > 0 && c.paid < c.amount;

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs font-semibold">{time}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">{c.patientName}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{c.type || '-'}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-700">
                                                {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.amount)} DA
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.paid)} DA
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {isPaid ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Payé</span>
                                                ) : isPartial ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Partiel</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Impayé</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function TodayResume() {
    return <DailyResume />;
}
