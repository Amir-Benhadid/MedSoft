import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import { Activity, CheckCircle } from 'lucide-react';
import { useInConsultation } from '@/ui/hooks/useWorkflow';
import { useUpdateAppointment } from '@/ui/hooks/useAppointments';
import { useUpdateWaitlistStatus } from '@/ui/hooks/useWaitlist';
import { cn } from "@/ui/lib/utils";

export default function ConsultationSection() {
    const inConsultation = useInConsultation();
    const updateAppointment = useUpdateAppointment();
    const updateWaitlist = useUpdateWaitlistStatus();

    const handleCompleteConsultation = (patient: any) => {
        if (!patient) return;

        if (patient.appointmentId) {
            updateAppointment.mutate({
                id: patient.appointmentId,
                updates: { state: 'completed' }
            });
        }
        else if (patient.waitlistId) {
            updateWaitlist.mutate({
                id: patient.waitlistId,
                state: 'completed'
            });
        }
    };

    return (
        <div className={cn(
            "p-3 rounded-2xl transition-all border shadow-sm group",
            inConsultation
                ? "bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200"
                : "bg-white/80 border-slate-100 hover:bg-white hover:border-slate-200"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                    inConsultation ? "bg-white/20 text-white" : "bg-slate-100"
                )}>
                    <Activity className={cn(
                        "h-4 w-4",
                        inConsultation ? "text-white" : "text-slate-400"
                    )} />
                </div>

                <div className="flex-1 min-w-0">
                    {inConsultation ? (
                        <div>
                            <p className="text-sm font-semibold text-white truncate">
                                {inConsultation.name} {inConsultation.surname}
                            </p>
                            <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-tight">En consultation</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-slate-400">Consultation</p>
                            <p className="text-[10px] text-slate-300 font-medium uppercase tracking-tight italic">Aucun en cours</p>
                        </div>
                    )}
                </div>

                {inConsultation && (
                    <Button
                        size="sm"
                        onClick={() => handleCompleteConsultation(inConsultation)}
                        className="h-8 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg shadow-sm"
                    >
                        <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
}
