import { Button } from "@/ui/components/ui/button";
import { Dumbbell, CheckCircle, User } from 'lucide-react';
import { useWaitlist, useUpdateWaitlistStatus } from '@/ui/hooks/useWaitlist';
import { useAppointments, useUpdateAppointment } from '@/ui/hooks/useAppointments';
import { useMemo } from 'react';
import { cn } from "@/ui/lib/utils";
import { getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { Badge } from "@/ui/components/ui/badge";

export default function RehabilitationSection() {
    const today = useMemo(() => getLocalTodayDate(), []);
    const { start, end } = useMemo(() => getDayRangeEncoded(today), [today]);

    // Fetch both waitlist and appointments
    const { data: waitlist = [] } = useWaitlist(today);
    const { data: appointments = [] } = useAppointments(start, end);

    const updateWaitlist = useUpdateWaitlistStatus();
    const updateAppointment = useUpdateAppointment();

    // Filter patients in rehabilitation from both sources
    const rehabilitationPatients = useMemo(() => {
        const waitlistPatients = waitlist
            .filter(w => w.state === 'in_rehabilitation')
            .map(w => ({
                id: w.id,
                source: 'waitlist',
                name: w.patient_name || '?',
                surname: w.patient_surname || 'Patient'
            }));

        const appointmentPatients = appointments
            .filter(a => a.state === 'in_rehabilitation')
            .map(a => ({
                id: a.id,
                source: 'appointment',
                name: a.patient?.name || '?',
                surname: a.patient?.surname || 'Patient'
            }));

        return [...waitlistPatients, ...appointmentPatients];
    }, [waitlist, appointments]);

    const handleComplete = (patient: any) => {
        if (patient.source === 'waitlist') {
            updateWaitlist.mutate({ id: patient.id, state: 'completed' });
        } else {
            updateAppointment.mutate({ id: patient.id, updates: { state: 'completed' } });
        }
    };

    const minimumSlots = 3;
    const filledSlots = rehabilitationPatients.length;
    const emptySlots = Math.max(0, minimumSlots - filledSlots);

    // Calculate height: 3 items * ~72px (item height with padding) = 216px
    // Using h-[220px] to be safe.

    return (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-md">
                        <Dumbbell className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-indigo-900">En Rééducation</span>
                </div>
                <Badge variant="secondary" className="bg-white text-indigo-600 border-indigo-100 font-bold">
                    {filledSlots}
                </Badge>
            </div>

            <ScrollArea className="h-[225px]">
                <div className="divide-y divide-slate-100">
                    {rehabilitationPatients.map(patient => (
                        <div key={`${patient.source}-${patient.id}`} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group">
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                                "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                            )}>
                                <Dumbbell className="h-5 w-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                    {patient.name} {patient.surname}
                                </p>
                                <p className="text-[10px] text-indigo-600 font-medium uppercase tracking-tight">En cours</p>
                            </div>

                            <Button
                                size="sm"
                                onClick={() => handleComplete(patient)}
                                className="h-8 w-8 p-0 rounded-full bg-slate-100 text-slate-400 hover:bg-green-600 hover:text-white transition-all shadow-none hover:shadow-md"
                                title="Terminer"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    {Array.from({ length: emptySlots }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-3 flex items-center gap-3 opacity-40 select-none">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                                <User className="h-5 w-5 text-slate-300" />
                            </div>
                            <div className="flex-1">
                                <div className="h-4 w-24 bg-slate-100 rounded mb-1.5"></div>
                                <div className="h-3 w-16 bg-slate-50 rounded"></div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-dashed border-slate-200"></div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
