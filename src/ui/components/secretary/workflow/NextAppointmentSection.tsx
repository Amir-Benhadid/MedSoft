import { Label } from '@/ui/components/ui/label';
import { Badge } from '@/ui/components/ui/badge';
import { Card } from '@/ui/components/ui/card';
import { CalendarClock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NextAppointmentSectionProps {
    nextAppt: any;
}

export function NextAppointmentSection({ nextAppt }: NextAppointmentSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md shadow-indigo-200/60 flex items-center justify-center text-white">
                    <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-800">Communication Patient</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Prochain rendez-vous demandé</p>
                </div>
            </div>

            {nextAppt ? (
                <Card className="p-0 overflow-hidden border-indigo-100 shadow-sm">
                    <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm shrink-0 border border-indigo-100">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm">Prochain Rendez-vous</h4>
                                {nextAppt.date ? (
                                    <p className="text-lg font-bold text-indigo-700 capitalize mt-0.5">
                                        {format(new Date(nextAppt.date), 'EEEE d MMMM', { locale: fr })}
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-slate-500 italic mt-0.5">
                                        Date non définie (À fixer)
                                    </p>
                                )}
                            </div>
                        </div>

                        {(nextAppt.timeframe || nextAppt.reason) && (
                            <div className="pt-2 border-t border-indigo-100/60 flex flex-wrap gap-2">
                                {nextAppt.timeframe && (
                                    <Badge variant="secondary" className="bg-white/80 text-indigo-700 hover:bg-white text-xs border border-indigo-100/50 font-semibold">
                                        Dans: {nextAppt.timeframe}
                                    </Badge>
                                )}
                                {nextAppt.reason && (
                                    <Badge variant="secondary" className="bg-white/80 text-slate-600 hover:bg-white text-xs border border-slate-200/50 font-semibold">
                                        Motif: {nextAppt.reason}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="p-4 bg-slate-50/80 border-slate-200 shadow-none">
                    <div className="flex items-center gap-3 text-slate-400">
                        <Calendar className="w-4 h-4 opacity-50" />
                        <span className="text-sm font-medium">Aucun prochain RDV demandé</span>
                    </div>
                </Card>
            )}
        </div>
    );
}
