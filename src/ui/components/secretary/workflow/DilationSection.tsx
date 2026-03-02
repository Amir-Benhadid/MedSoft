import { Badge } from "@/ui/components/ui/badge";
import { Eye, Clock, Droplet, CheckCircle } from 'lucide-react';
import { usePatientsNeedingDilation } from '@/ui/hooks/useWorkflow';
import { useToggleDilation, useFinishDilation } from '@/ui/hooks/useAppointments';
import { useWaitlistToggleDilation, useWaitlistFinishDilation } from '@/ui/hooks/useWaitlist';
import { useEffect, useState } from 'react';
import { cn } from "@/ui/lib/utils";
import { useConfig } from "@/ui/contexts/ConfigContext";

export default function DilationSection() {
    const patientsNeedingDilation = usePatientsNeedingDilation();
    const toggleAppointmentDilation = useToggleDilation();
    const toggleWaitlistDilation = useWaitlistToggleDilation();

    const finishAppointmentDilation = useFinishDilation();
    const finishWaitlistDilation = useWaitlistFinishDilation();

    const [currentTime, setCurrentTime] = useState(new Date());

    // Track local states for animation phases
    // completing: 3s green "Completed" phase
    // exiting: 500ms slide-out phase
    const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
    const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Check for auto-completion
            patientsNeedingDilation.forEach((patient: any) => {
                // If already processed or waiting, skip
                if (!patient.dilation_started_at ||
                    patient.dilation_status === 'dilated' ||
                    completingIds.has(patient.id) ||
                    exitingIds.has(patient.id)) return;

                const remaining = calculateRemainingSeconds(patient.dilation_started_at, now);

                // If expired long ago (e.g. > 5 seconds ago), silent kill
                if (remaining < -5) {
                    executeFinishMutation(patient);
                    return;
                }

                if (remaining <= 0) {
                    triggerCompletionFlow(patient);
                }
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [patientsNeedingDilation, completingIds, exitingIds]);

    // Helper to calculate raw seconds strictly for logic
    const calculateRemainingSeconds = (startTime: string | null, nowCtx: Date) => {
        if (!startTime) return 999999;
        let start = new Date(startTime).getTime();
        const now = nowCtx.getTime();

        // --- Timezone Fix Logic from before ---
        const rawDiff = now - start;
        if (rawDiff < -14400000) { // < -4 hours (future)
            const offset = new Date().getTimezoneOffset() * 60 * 1000;
            start -= offset;
        }
        let startObj = new Date(startTime);
        if (startTime.indexOf('Z') === -1 && startTime.indexOf('+') === -1) {
            const asUTC = new Date(startTime + 'Z').getTime();
            if (Math.abs(now - asUTC) < Math.abs(now - startObj.getTime())) {
                start = asUTC;
            }
        }
        // --------------------------------------

        const diff = now - start;
        return ((30 * 60 * 1000) - diff) / 1000;
    };

    const triggerCompletionFlow = (patient: any) => {
        if (completingIds.has(patient.id) || exitingIds.has(patient.id)) return;

        // 1. Mark as completing (Green)
        setCompletingIds(prev => new Set(prev).add(patient.id));

        // 2. Wait 3 seconds
        setTimeout(() => {
            setCompletingIds(prev => {
                const next = new Set(prev);
                next.delete(patient.id);
                return next;
            });
            setExitingIds(prev => new Set(prev).add(patient.id));

            // 3. Wait for slide out animation (e.g. 500ms) then mutate
            setTimeout(() => {
                executeFinishMutation(patient);
                // We keep it in exitingIds until it disappears from the list naturally via re-render
                // Cleanup will happen when component unmounts or id is no longer in list
            }, 500);
        }, 3000);
    };

    const executeFinishMutation = (patient: any) => {
        if (patient.appointmentId) {
            finishAppointmentDilation.mutate(patient.appointmentId);
        } else if (patient.waitlistId) {
            finishWaitlistDilation.mutate(patient.waitlistId);
        }
    };

    const handleStartDilation = (patient: any) => {
        if (!patient) return;
        if (patient.appointmentId) {
            toggleAppointmentDilation.mutate({ id: patient.appointmentId, needsDilation: true });
        } else if (patient.waitlistId) {
            toggleWaitlistDilation.mutate({ id: patient.waitlistId, needsDilation: true });
        }
    };

    // Calculate display values
    const calculateProgress = (startTime: string | null, status: string | null) => {
        if (status === 'dilated') return 100;
        if (!startTime) return 0;

        // Re-use logic briefly or keep separate? 
        // Logic duplicated for safety/render speed without complex helpers
        let start = new Date(startTime).getTime();
        const now = currentTime.getTime();
        const rawDiff = now - start;
        // Fix TZ
        if (rawDiff < -14400000) {
            const offset = new Date().getTimezoneOffset() * 60 * 1000;
            start -= offset;
        } else {
            let startObj = new Date(startTime);
            if (startTime.indexOf('Z') === -1 && startTime.indexOf('+') === -1) {
                const asUTC = new Date(startTime + 'Z').getTime();
                if (Math.abs(now - asUTC) < Math.abs(now - startObj.getTime())) {
                    start = asUTC;
                }
            }
        }

        const elapsed = now - start;
        return Math.min((elapsed / (30 * 60 * 1000)) * 100, 100);
    };

    const calculateTimeRemaining = (startTime: string | null, status: string | null) => {
        if (status === 'dilated') return 'PRÊT';
        if (!startTime) return '0:00';

        const secondsLeft = calculateRemainingSeconds(startTime, currentTime);
        if (secondsLeft <= 0) return 'PRÊT';

        const remaining = secondsLeft * 1000;
        const minutes = Math.floor(remaining / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Filter patients
    // Dilation started if: status is 'dilated' OR dilation_started_at is set
    const dilatingPatients = patientsNeedingDilation.filter((p: any) => {
        if (!p.needs_dilation) return false;
        if (p.dilation_status === 'dilated') return false;
        if (!p.dilation_started_at) return false;

        // Hide if silent expiring (unless we are animating it)
        if (!completingIds.has(p.id) && !exitingIds.has(p.id)) {
            const rem = calculateRemainingSeconds(p.dilation_started_at, currentTime);
            if (rem < -5) return false; // Hide immediately if old
        }
        return true;
    });

    const waitingForDilation = patientsNeedingDilation.filter((p: any) =>
        p.needs_dilation && !p.dilation_started_at && p.dilation_status !== 'dilated'
    );

    const { businessType } = useConfig();
    const isOphthalmology = businessType === 'cabinet-ophthalmologie';

    if (patientsNeedingDilation.length === 0 && !isOphthalmology) return null;

    return (
        <div className="flex flex-col h-full">
            {/* Header with vertical padding */}
            <div className="flex items-center gap-2 px-1 py-3">
                <div className="p-1.5 rounded-lg bg-indigo-100/50">
                    <Eye className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Dilatation</h3>
                <Badge variant="secondary" className="bg-white text-indigo-600 ml-auto border-indigo-100 h-5 px-1.5 text-[10px] font-bold">
                    {patientsNeedingDilation.length}
                </Badge>
            </div>

            {/* Scrollable content area that takes up remaining height */}
            <div className={cn(
                "flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar space-y-1",
                !isOphthalmology && "min-h-0"
            )}>
                {/* Currently Dilating */}
                {dilatingPatients.map((patient: any) => {
                    // Check local state overrides
                    const isCompleting = completingIds.has(patient.id);
                    const isExiting = exitingIds.has(patient.id);

                    const progress = isCompleting || isExiting ? 100 : calculateProgress(patient.dilation_started_at, patient.dilation_status);
                    const timeRemaining = isCompleting || isExiting ? 'COMPLÉTÉ' : calculateTimeRemaining(patient.dilation_started_at, patient.dilation_status);

                    // If backend says complete AND we aren't animating, shows green.
                    // But if backend says complete, usually it disappears from this list?
                    // "dilatingPatients" filter creates inclusion based on "dilation_started_at || status=dilated".
                    // If finishDilation clears "needs_dilation", it leaves the list entirely.
                    // So we rely on local state 'exitingIds' to hold the visual space if the data vanishes?
                    // Ah, effectively if it disappears from data, the map iteration won't find it.
                    // We might need to keep it artificially? 
                    // No, the mutation happens AT THE END of exiting. So data stays until animation done.

                    // Use standard "isComplete" visual if progress 100 OR local completing state
                    const showAsComplete = progress >= 100 || isCompleting || isExiting;

                    return (
                        <div key={patient.id} className={cn(
                            "group flex flex-col rounded-2xl border shadow-sm transition-all duration-500 overflow-hidden",
                            isExiting ? "max-h-0 opacity-0 translate-x-full mb-0 border-0 p-0" : "max-h-24 opacity-100 p-3 mb-2",
                            showAsComplete ? "bg-white border-emerald-200 ring-2 ring-emerald-50" : "bg-white border-indigo-100"
                        )}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-slate-900 truncate">
                                        {patient.name} {patient.surname}
                                    </span>
                                    {patient.dilation_type && (
                                        <span className="text-[10px] text-slate-500 font-medium truncate">
                                            {patient.dilation_type} {patient.dilation_eye && <span className="text-indigo-600">({patient.dilation_eye})</span>}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {!showAsComplete && (
                                        <button
                                            onClick={() => triggerCompletionFlow(patient)}
                                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium transition-colors"
                                            title="Forcer la fin"
                                        >
                                            Forcer
                                        </button>
                                    )}
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-300",
                                        showAsComplete ? "bg-emerald-100 text-emerald-700" : "text-indigo-600 bg-indigo-50"
                                    )}>
                                        {timeRemaining}
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        showAsComplete ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                                    )}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* Waiting to start */}
                {waitingForDilation.map((patient: any) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/80 border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all shadow-sm group">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{patient.name} {patient.surname}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                {patient.dilation_type ? (
                                    <>
                                        {patient.dilation_type} {patient.dilation_eye && <span className="text-indigo-600 font-bold">({patient.dilation_eye})</span>}
                                    </>
                                ) : "En attente de gouttes"}
                            </span>
                        </div>
                        <button
                            onClick={() => handleStartDilation(patient)}
                            className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 group-hover:scale-110"
                        >
                            <Droplet className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}

                {isOphthalmology && patientsNeedingDilation.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-xs">
                        <Droplet className="h-6 w-6 mb-2 opacity-20" />
                        Aucune dilatation en cours
                    </div>
                )}
            </div>
        </div>
    );
}
