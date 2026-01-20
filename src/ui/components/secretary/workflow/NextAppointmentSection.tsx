import { Label } from '@/ui/components/ui/label';
import { Badge } from '@/ui/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NextAppointmentSectionProps {
    nextAppt: any; // Ideally types should be imported
}

export function NextAppointmentSection({ nextAppt }: NextAppointmentSectionProps) {
    return (
        <div className="space-y-2">
            <Label className="uppercase text-xs font-bold text-slate-500 tracking-wider">Communication Patient</Label>
            {nextAppt ? (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm">Prochain Rendez-vous</h4>
                            {nextAppt.date ? (
                                <p className="text-lg font-bold text-blue-700 capitalize mt-0.5">
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
                        <div className="pt-2 border-t border-blue-100/50 flex flex-wrap gap-2">
                            {nextAppt.timeframe && (
                                <Badge variant="secondary" className="bg-white/50 text-blue-700 hover:bg-white text-xs">
                                    Dans: {nextAppt.timeframe}
                                </Badge>
                            )}
                            {nextAppt.reason && (
                                <Badge variant="secondary" className="bg-white/50 text-slate-600 hover:bg-white text-xs">
                                    Motif: {nextAppt.reason}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 text-slate-400">
                    <Calendar className="w-5 h-5 opacity-50" />
                    <span className="text-sm font-medium">Aucun prochain RDV demandé</span>
                </div>
            )}
        </div>
    );
}
