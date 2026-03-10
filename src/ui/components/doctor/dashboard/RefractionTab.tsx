import { memo } from 'react';
import { EyeRefractionPanel } from "./EyeRefractionPanel";
import { EyeData } from "./types";
import { Button } from "@/ui/components/ui/button";
import { Copy, Loader2, Droplet, Eye } from "lucide-react";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { useAppointments, useToggleDilation } from "@/ui/hooks/useAppointments";
import { useWaitlist, useWaitlistToggleDilation } from "@/ui/hooks/useWaitlist";
import { getLocalTodayDate, getDayRangeEncoded } from "@/ui/lib/time";
import { DoctorDilationDialog } from "./DoctorDilationDialog";
import { cn } from "@/ui/lib/utils";
import { useState } from "react";

interface RefractionTabProps {
    readOnly?: boolean;
    data?: {
        leftEye?: EyeData;
        rightEye?: EyeData;
    };
    patient?: any;
}

function RefractionTab({ readOnly, data, patient }: RefractionTabProps) {
    // Use selectors to get full objects for copying
    const setLeftEye = useConsultationStore(state => state.setLeftEye);
    const setRightEye = useConsultationStore(state => state.setRightEye);

    // Dilation Logic
    const today = getLocalTodayDate();
    const { start, end } = getDayRangeEncoded(today);
    const { data: appointments = [] } = useAppointments(start, end);
    const { data: waitlist = [] } = useWaitlist(today);

    // Find active item (Appointment takes precedence)
    const activeAppointment = appointments.find((a: any) => a.patient_id === patient?.id && a.state !== 'completed');
    const activeWaitlist = !activeAppointment ? waitlist.find((w: any) => w.patient_id === patient?.id && w.state !== 'completed') : null;

    const toggleApptDilation = useToggleDilation();
    const toggleWaitlistDilation = useWaitlistToggleDilation();
    const [isDilationDialogOpen, setIsDilationDialogOpen] = useState(false);

    const isDilating = activeAppointment?.needs_dilation || activeWaitlist?.needs_dilation;

    const handleDilationClick = () => {
        if (isDilating) {
            // Stop dilation immediately
            if (activeAppointment) {
                toggleApptDilation.mutate({ id: activeAppointment.id, needsDilation: false });
            } else if (activeWaitlist) {
                toggleWaitlistDilation.mutate({ id: activeWaitlist.id, needsDilation: false });
            }
        } else {
            // Open dialog to start dilation
            setIsDilationDialogOpen(true);
        }
    };

    const handleDilationConfirm = (product: string, eye: string) => {
        if (activeAppointment) {
            // @ts-ignore - Hook update pending
            toggleApptDilation.mutate({ id: activeAppointment.id, needsDilation: true, dilationType: product, eye });
        } else if (activeWaitlist) {
            // @ts-ignore - Hook update pending
            toggleWaitlistDilation.mutate({ id: activeWaitlist.id, needsDilation: true, dilationType: product, eye });
        }
        setIsDilationDialogOpen(false);
    };

    const copyToLeft = (e?: React.MouseEvent) => {
        e?.preventDefault();
        const rightEye = useConsultationStore.getState().rightEye;
        setLeftEye({ ...rightEye });
    };

    const copyToRight = (e?: React.MouseEvent) => {
        e?.preventDefault();
        const leftEye = useConsultationStore.getState().leftEye;
        setRightEye({ ...leftEye });
    };

    return (
        <div className="h-full flex flex-col transition-all duration-300" style={{ gap: 'var(--dash-gap)' }}>
            {/* Main Header */}
            <div className="bg-slate-50/90 rounded-md border border-slate-200 shadow-sm flex items-center justify-between transition-all" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 3)' }}>
                <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'calc(var(--dash-label) * 1.2)' }}>Réfraction</span>

                {/* Dilation Button */}
                {!readOnly && (activeAppointment || activeWaitlist) && (
                    <Button
                        type="button"
                        size="sm"
                        variant={isDilating ? "secondary" : "outline"}
                        className={cn(
                            "gap-1.5 px-2 h-6 xl:h-7 text-[10px] xl:text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors",
                            isDilating && "bg-indigo-100 border-indigo-300"
                        )}
                        onClick={handleDilationClick}
                        disabled={toggleApptDilation.isPending || toggleWaitlistDilation.isPending}
                    >
                        {isDilating ? <Loader2 className="w-3 h-3 xl:w-3.5 xl:h-3.5 animate-spin" /> : <Droplet className="w-3 h-3 xl:w-3.5 xl:h-3.5" />}
                        {isDilating ? "Dilatation..." : "Dilater"}
                    </Button>
                )}
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 xl:grid-rows-1" style={{ gap: 'var(--dash-gap)' }}>
                <EyeRefractionPanel
                    side="right"
                    readOnly={readOnly}
                    data={data?.rightEye}
                    action={
                        !readOnly && (
                            <Button type="button" variant="ghost" size="sm" onClick={copyToRight} title="Copier OG vers OD" className="h-5 xl:h-6 2xl:h-8 px-1.5 xl:px-2 text-[10px] xl:text-xs 2xl:text-sm hover:bg-green-100">
                                <Copy className="w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-1" /> OG &#8594; OD
                            </Button>
                        )
                    }
                />
                <EyeRefractionPanel
                    side="left"
                    readOnly={readOnly}
                    data={data?.leftEye}
                    action={
                        !readOnly && (
                            <Button type="button" variant="ghost" size="sm" onClick={copyToLeft} title="Copier OD vers OG" className="h-5 xl:h-6 2xl:h-8 px-1.5 xl:px-2 text-[10px] xl:text-xs 2xl:text-sm hover:bg-blue-100">
                                <Copy className="w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-1" /> OD &#8594; OG
                            </Button>
                        )
                    }
                />
            </div>

            <DoctorDilationDialog
                isOpen={isDilationDialogOpen}
                onClose={() => setIsDilationDialogOpen(false)}
                onConfirm={handleDilationConfirm}
                isSubmitting={toggleApptDilation.isPending || toggleWaitlistDilation.isPending}
            />
        </div>
    );
}

export default memo(RefractionTab);
