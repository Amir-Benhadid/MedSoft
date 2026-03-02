import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import { User, UserPlus, Stethoscope, Dumbbell, RefreshCcw } from 'lucide-react';
import { useWorkflowStore } from '@/ui/hooks/useWorkflowStore';
import { useUpdateAppointment } from '@/ui/hooks/useAppointments';
import { useUpdateWaitlistStatus } from '@/ui/hooks/useWaitlist';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useMemo } from 'react';
import { cn } from "@/ui/lib/utils";
import { useConfig } from "@/ui/contexts/ConfigContext";

import { getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';

export default function PatientSelectionSection() {
    const { selectedPatient, setPatientSelectorOpen, setSelectedPatient } = useWorkflowStore();
    const updateAppointment = useUpdateAppointment();
    const updateWaitlist = useUpdateWaitlistStatus();
    const { businessType } = useConfig();

    const today = useMemo(() => getLocalTodayDate(), []);

    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', today],
        queryFn: () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.appointments.list(range);
        },
        enabled: !!selectedPatient
    });

    const { data: waitlist = [] } = useQuery({
        queryKey: ['waitlist', today],
        queryFn: () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.waitlist.list(range);
        },
        enabled: !!selectedPatient
    });

    const handleStartConsultation = (patient: any) => {
        if (!patient) return;

        const apt = appointments.find(a => a.patient_id === patient.id && a.state !== 'completed' && a.state !== 'paid');
        const wait = waitlist.find(w => w.patient_id === patient.id && w.state !== 'completed' && w.state !== 'paid');

        if (apt) {
            updateAppointment.mutate({ id: apt.id, updates: { state: 'in_consultation' } });
            setPatientSelectorOpen(false); // Close selector if open
            setSelectedPatient(null);
        } else if (wait) {
            updateWaitlist.mutate({ id: wait.id, state: 'in_consultation' });
            setPatientSelectorOpen(false);
            setSelectedPatient(null);
        }
    };

    const handleStartRehabilitation = (patient: any) => {
        if (!patient) return;

        const wait = waitlist.find(w => w.patient_id === patient.id && w.state !== 'completed' && w.state !== 'paid');

        if (wait) {
            updateWaitlist.mutate({ id: wait.id, state: 'in_rehabilitation' });
            setSelectedPatient(null);
        } else {
            const apt = appointments.find(a => a.patient_id === patient.id && a.state !== 'completed' && a.state !== 'paid');
            if (apt) {
                updateAppointment.mutate({ id: apt.id, updates: { state: 'in_rehabilitation' } });
                setSelectedPatient(null);
            }
        }
    };

    return (
        <div className={cn(
            "p-3 rounded-2xl transition-all border shadow-sm group",
            selectedPatient
                ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200"
                : "bg-white/80 border-slate-100 hover:bg-white hover:border-slate-200"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                    selectedPatient ? "bg-white/20 text-white" : "bg-slate-100"
                )}>
                    <User className={cn(
                        "h-4 w-4",
                        selectedPatient ? "text-white" : "text-slate-400"
                    )} />
                </div>

                <div className="flex-1 min-w-0">
                    {selectedPatient ? (
                        <div>
                            <p className="text-sm font-semibold text-white truncate">
                                {selectedPatient.name} {selectedPatient.surname}
                            </p>
                            <p className="text-[10px] text-blue-100 font-medium uppercase tracking-tight">Sélectionné</p>
                        </div>
                    ) : (
                        <button
                            onClick={() => setPatientSelectorOpen(true)}
                            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Choisir un patient
                        </button>
                    )}
                </div>

                {selectedPatient && (
                    <div className="flex gap-1 items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPatientSelectorOpen(true)}
                            className="h-8 w-8 text-blue-100 hover:text-white hover:bg-white/20 rounded-lg mr-1"
                            title="Changer de patient"
                        >
                            <RefreshCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleStartConsultation(selectedPatient)}
                            className="h-8 bg-white hover:bg-blue-50 text-blue-600 rounded-lg shadow-sm"
                            title="Démarrer Consultation"
                        >
                            <Stethoscope className="h-3.5 w-3.5" />
                        </Button>
                        {businessType === 'kinesis' && (
                            <Button
                                size="sm"
                                onClick={() => handleStartRehabilitation(selectedPatient)}
                                className="h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg shadow-sm"
                                title="Démarrer Rééducation"
                            >
                                <Dumbbell className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}
