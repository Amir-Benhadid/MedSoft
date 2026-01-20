import { memo, useState } from 'react';
import { ArrowLeft, Save, Loader2, Droplet } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { useAppointments, useToggleDilation } from '@/ui/hooks/useAppointments';
import { useWaitlist, useWaitlistToggleDilation } from '@/ui/hooks/useWaitlist';
import { cn } from '@/ui/lib/utils';
import { DoctorDilationDialog } from './DoctorDilationDialog';

interface DashboardHeaderProps {
    patient: any;
    onBack?: () => void;
    saveMutation: any;
    setIsFinishSheetOpen: (val: boolean) => void;
    isFinishSheetOpen: boolean;
    onOpenHistory: () => void;
    showFinishButton?: boolean;
}

import { getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';

export const DashboardHeader = memo(function DashboardHeader({
    patient,
    onBack,
    saveMutation,
    setIsFinishSheetOpen,
    isFinishSheetOpen,
    onOpenHistory,
    showFinishButton = true
}: DashboardHeaderProps) {
    const today = getLocalTodayDate();
    const { start, end } = getDayRangeEncoded(today);
    const { data: appointments = [] } = useAppointments(start, end);
    const { data: waitlist = [] } = useWaitlist(today);

    // Find active item (Appointment takes precedence)
    const activeAppointment = appointments.find(a => a.patient_id === patient?.id && a.state !== 'completed');
    const activeWaitlist = !activeAppointment ? waitlist.find(w => w.patient_id === patient?.id && w.state !== 'completed') : null;

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

    const handleDilationConfirm = (product: string) => {
        if (activeAppointment) {
            // @ts-ignore - Hook update pending
            toggleApptDilation.mutate({ id: activeAppointment.id, needsDilation: true, dilationType: product });
        } else if (activeWaitlist) {
            // @ts-ignore - Hook update pending
            toggleWaitlistDilation.mutate({ id: activeWaitlist.id, needsDilation: true, dilationType: product });
        }
        setIsDilationDialogOpen(false);
    };

    if (!patient) return null;

    return (
        <>
            <header className="bg-white border-b px-6 py-3 shadow-sm flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-9 w-9">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-xl">👤</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                                {patient.name} {patient.surname}
                            </h1>
                            <p className="text-slate-500 text-xs flex items-center gap-3 mt-1 font-medium">
                                <span>{patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>{patient.phone_number ?? 'N/A'}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Dilation Button */}
                    {(activeAppointment || activeWaitlist) && (
                        <Button
                            size="sm"
                            variant={isDilating ? "secondary" : "outline"}
                            className={cn(
                                "gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50",
                                isDilating && "bg-indigo-100 border-indigo-300"
                            )}
                            onClick={handleDilationClick}
                            disabled={toggleApptDilation.isPending || toggleWaitlistDilation.isPending}
                        >
                            {isDilating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Droplet className="w-4 h-4" />}
                            {isDilating ? "Dilatation en cours..." : "Dilater"}
                        </Button>
                    )}

                    {/* History Button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2"
                        onClick={onOpenHistory}
                    >
                        <span className="text-xl">📅</span>
                        Historique
                    </Button>

                    {/* Manual Save Button */}
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => saveMutation.mutate({ finish: false })}
                    >
                        {saveMutation.isPending && !isFinishSheetOpen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                    </Button>

                    {showFinishButton && (
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                            onClick={() => setIsFinishSheetOpen(true)}
                        >
                            <Save className="w-4 h-4" />
                            Terminer la consultation
                        </Button>
                    )}
                </div>
            </header>

            <DoctorDilationDialog
                isOpen={isDilationDialogOpen}
                onClose={() => setIsDilationDialogOpen(false)}
                onConfirm={handleDilationConfirm}
                isSubmitting={toggleApptDilation.isPending || toggleWaitlistDilation.isPending}
            />
        </>
    );
});
