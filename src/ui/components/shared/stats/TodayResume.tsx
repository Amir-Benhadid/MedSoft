import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/ui/card';
import { Users, CreditCard, Loader2 } from 'lucide-react';
import { getLocalISOString } from '@/ui/lib/time';

interface DailyResumeProps {
    date?: Date;
    title?: string;
}

export function DailyResume({ date, title }: DailyResumeProps) {
    const targetDate = date || new Date();
    const dateStr = date ? getLocalISOString(date).slice(0, 10) : getLocalISOString().slice(0, 10);

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
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">{displayTitle}</h2>
                {!title && !date && (
                    <p className="text-slate-500">Statistiques pour le {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium text-slate-700">Total Consultations</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-900">{summary.consultationCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Patients vus ce jour</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium text-slate-700">Montant Dû</CardTitle>
                        <CreditCard className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-900">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(summary.totalDue)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Valeur totale des consultations</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-medium text-slate-700">Total Encaissé</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-900">
                            {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(summary.income)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Montant réellement perçu</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Détail des Consultations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Heure</th>
                                <th className="px-4 py-3 font-medium">Patient</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium text-right">Montant Dû</th>
                                <th className="px-4 py-3 font-medium text-right">Payé</th>
                                <th className="px-4 py-3 font-medium text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {consultations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        Aucune consultation enregistrée pour ce jour
                                    </td>
                                </tr>
                            ) : (
                                consultations.map((c) => {
                                    const time = new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    const isPaid = c.paid >= c.amount;
                                    const isPartial = c.paid > 0 && c.paid < c.amount;

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 text-slate-500 font-mono">{time}</td>
                                            <td className="px-4 py-3 font-medium text-slate-900">{c.patientName}</td>
                                            <td className="px-4 py-3 text-slate-600">{c.type || '-'}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.amount)} DA
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.paid)} DA
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {isPaid ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Payé</span>
                                                ) : isPartial ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Partiel</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Impayé</span>
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
