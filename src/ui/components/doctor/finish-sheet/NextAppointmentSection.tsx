import { Calendar } from 'lucide-react';
import { Label } from '@/ui/components/ui/label';
import { Input } from '@/ui/components/ui/input';
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
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Calendar className="w-4 h-4" />
                </div>
                Prochain Rendez-vous
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</Label>
                        <Select value={nextApptType} onValueChange={setNextApptType}>
                            <SelectTrigger className="bg-slate-50 border-slate-200">
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
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date (Optionnel)</Label>
                        <Input
                            type="date"
                            value={nextApptDate}
                            onChange={(e) => {
                                setNextApptDate(e.target.value);
                                setNextApptTimeframe('');
                            }}
                            className="bg-slate-50 border-slate-200"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ou Délai (Recommandé)</Label>
                    <Select
                        value={nextApptTimeframe}
                        onValueChange={(val) => {
                            setNextApptTimeframe(val);
                            setNextApptDate('');
                        }}
                    >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
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
        </div>
    );
}
