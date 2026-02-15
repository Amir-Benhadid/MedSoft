import { CalendarClock } from 'lucide-react';
import { Label } from '@/ui/components/ui/label';
import { Input } from '@/ui/components/ui/input';
import { Card } from '@/ui/components/ui/card';
import { Badge } from '@/ui/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';

interface NextAppointmentSectionProps {
    nextApptType: string;
    setNextApptType: (val: string) => void;
    nextApptDate: string;
    setNextApptDate: (val: string) => void;
    nextApptTimeframe: string;
    setNextApptTimeframe: (val: string) => void;
}

export function NextAppointmentSection({
    nextApptType,
    setNextApptType,
    nextApptDate,
    setNextApptDate,
    nextApptTimeframe,
    setNextApptTimeframe
}: NextAppointmentSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-200/60 flex items-center justify-center text-white">
                    <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Prochain Rendez-vous</h2>
                    <p className="text-xs text-slate-500 font-medium">Planifier le suivi du patient</p>
                </div>
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-slate-200">
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</Label>
                            <Select value={nextApptType} onValueChange={setNextApptType}>
                                <SelectTrigger className="h-10 bg-slate-50/80 border-slate-200 focus:border-indigo-400 focus:ring-indigo-100">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="control">Contrôle</SelectItem>
                                    <SelectItem value="consultation">Consultation</SelectItem>
                                    <SelectItem value="surgery">Chirurgie</SelectItem>
                                    <SelectItem value="laser">Laser</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date (Optionnel)</Label>
                            <Input
                                type="date"
                                value={nextApptDate}
                                onChange={(e) => {
                                    setNextApptDate(e.target.value);
                                    setNextApptTimeframe('');
                                }}
                                className="h-10 bg-slate-50/80 border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dashed border-slate-200" />
                        </div>
                        <div className="relative flex justify-center">
                            <Badge variant="secondary" className="bg-white text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 px-3">
                                ou
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Délai (Recommandé)</Label>
                        <Select
                            value={nextApptTimeframe}
                            onValueChange={(val) => {
                                setNextApptTimeframe(val);
                                setNextApptDate('');
                            }}
                        >
                            <SelectTrigger className="h-10 bg-slate-50/80 border-slate-200 focus:border-indigo-400 focus:ring-indigo-100">
                                <SelectValue placeholder="Choisir un délai..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1 semaine">Dans 1 semaine</SelectItem>
                                <SelectItem value="1 mois">Dans 1 mois</SelectItem>
                                <SelectItem value="3 mois">Dans 3 mois</SelectItem>
                                <SelectItem value="6 mois">Dans 6 mois</SelectItem>
                                <SelectItem value="1 an">Dans 1 an</SelectItem>
                                <SelectItem value="2 ans">Dans 2 ans</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>
        </div>
    );
}
