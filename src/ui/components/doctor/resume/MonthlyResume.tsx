import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/ui/lib/utils';
import { Dialog, DialogContent } from '@/ui/components/ui/dialog';
import { DailyResume } from '@/ui/components/shared/stats/TodayResume';

export function MonthlyResume() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Start and End of month correctly calculated
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // To prevent timezone issues, we use manual formatting for API
    const formatDate = (d: Date) => {
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - (offset * 60 * 1000));
        return local.toISOString().slice(0, 10);
    };

    const startDateStr = formatDate(startOfMonth);
    const endDateStr = formatDate(endOfMonth);

    const { data, isLoading } = useQuery({
        queryKey: ['resume', 'monthly', startDateStr, endDateStr],
        queryFn: () => orpcClient.stats.getStats({ startDate: startDateStr, endDate: endDateStr }),
    });

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    // Helper to build calendar grid
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days: (Date | null)[] = [];

        // Pad start (Monday start)
        let startPadding = firstDay.getDay() - 1; // Monday start
        if (startPadding === -1) startPadding = 6; // Sunday -> 6

        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        // Pad end to fill 6 rows (42 cells) to keep height consistent
        const remaining = 42 - days.length;
        for (let i = 0; i < remaining; i++) {
            days.push(null);
        }

        return days;
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    if (isLoading) return <div className="flex h-full items-center justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>;

    const summary = data?.summary || { consultationCount: 0, income: 0, totalDue: 0 };
    const consultations = data?.consultations || [];

    // Aggregate for Calendar
    const dailyStats = new Map<string, { count: number, income: number }>();
    consultations.forEach(c => {
        const dateKey = c.date.slice(0, 10);
        const current = dailyStats.get(dateKey) || { count: 0, income: 0 };
        current.count += 1;
        current.income += c.paid;
        dailyStats.set(dateKey, current);
    });

    return (
        <div className="flex flex-col gap-6 p-6 h-full w-full max-w-7xl mx-auto overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Résumé Mensuel</h2>
                    <p className="text-slate-500">Vue globale des consultations et paiements</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-1 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="font-semibold w-32 text-center capitalize">
                        {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Totals Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Total Consultations</p>
                            <p className="text-2xl font-bold text-blue-900">{summary.consultationCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50/50 border-slate-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-600">Total Dû</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(summary.totalDue)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Revenu Total</p>
                            <p className="text-2xl font-bold text-emerald-900">
                                {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(summary.income)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Calendrier</h3>
                </div>
                {/* Week Header */}
                <div className="grid grid-cols-7 border-b bg-slate-50">
                    {weekDays.map(d => (
                        <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y h-[600px]">
                    {days.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} className="bg-slate-50/30" />;

                        const dateStr = formatDate(date);
                        const dayStats = dailyStats.get(dateStr);
                        const isToday = dateStr === new Date().toISOString().slice(0, 10);

                        return (
                            <div
                                key={dateStr}
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "p-2 flex flex-col gap-1 hover:bg-slate-100 transition-colors relative cursor-pointer group",
                                    isToday && "bg-blue-50/30 ring-1 ring-inset ring-blue-200"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 group-hover:bg-white group-hover:shadow-sm transition-all",
                                    isToday ? "bg-blue-600 text-white group-hover:bg-blue-600 group-hover:text-white" : "text-slate-700"
                                )}>
                                    {date.getDate()}
                                </span>

                                {dayStats && (dayStats.count > 0 || dayStats.income > 0) && (
                                    <div className="flex flex-col gap-1 mt-auto w-full">
                                        {dayStats.count > 0 && (
                                            <div className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium truncate">
                                                {dayStats.count} cons.
                                            </div>
                                        )}
                                        {dayStats.income > 0 && (
                                            <div className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium truncate">
                                                {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(dayStats.income)} DA
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-semibold text-slate-900">Liste des Consultations du Mois</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Patient</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium text-right">Montant Dû</th>
                                <th className="px-4 py-3 font-medium text-right">Payé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {consultations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Aucune consultation ce mois-ci
                                    </td>
                                </tr>
                            ) : (
                                consultations.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-slate-500 font-mono">
                                            {new Date(c.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{c.patientName}</td>
                                        <td className="px-4 py-3 text-slate-600">{c.type || '-'}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                                            {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.amount)} DA
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                            {new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(c.paid)} DA
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto w-full p-0">
                    {selectedDate && <DailyResume date={selectedDate} />}
                </DialogContent>
            </Dialog>
        </div >
    );
}
