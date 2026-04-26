import { memo } from 'react';
import { ArrowLeft, Save, Loader2, Settings } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { UpdateIndicator } from '@/ui/components/UpdateIndicator';
import { usePinDialog } from '@/ui/hooks/usePinDialog';
import { DoctorSettingsDialog } from './DoctorSettingsDialog';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/ui/components/ui/dialog";
import { Input } from "@/ui/components/ui/input";
import { formatPatientName } from "@/shared/formatters";
import { useConsultationStore } from "@/ui/store/consultationStore";

interface DashboardHeaderProps {
    patient: any;
    onBack?: () => void;
    saveMutation: any;
    setIsFinishSheetOpen: (val: boolean) => void;
    onFinishConsultation: () => void;
    isFinishSheetOpen: boolean;
    onOpenHistory: () => void;
    onOpenPaymentHistory: () => void;
    showFinishButton?: boolean;
    consultationStatus?: 'pending' | 'completed';
}

export const DashboardHeader = memo(function DashboardHeader({
    patient,
    onBack,
    saveMutation,
    setIsFinishSheetOpen,
    onFinishConsultation,
    isFinishSheetOpen,
    onOpenHistory,
    onOpenPaymentHistory,
    showFinishButton = true,
    consultationStatus
}: DashboardHeaderProps) {
    if (!patient) return null;

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const pinDialog = usePinDialog(() => {
        setIsSettingsOpen(true);
    });
    const isDirty = useConsultationStore(state => state.isDirty);

    return (
        <>
            <DoctorSettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

            {/* PIN Dialog */}
            <Dialog open={pinDialog.isOpen} onOpenChange={(open) => !open && pinDialog.closeDialog()}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Code PIN requis</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            type="password"
                            value={pinDialog.pin}
                            onChange={(e) => pinDialog.setPin(e.target.value)}
                            onKeyDown={pinDialog.handleKeyPress}
                            autoFocus
                            className="text-center text-2xl tracking-widest"
                            maxLength={4}
                        />
                        {pinDialog.error && (
                            <p className="text-sm text-red-500 text-center">{pinDialog.error}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={pinDialog.closeDialog}>
                            Annuler
                        </Button>
                        <Button onClick={pinDialog.handleSubmit} disabled={pinDialog.isLoading}>
                            {pinDialog.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Valider
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <header className="bg-white border-b px-6 py-0.5 shadow-sm flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 h-8 w-8">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    )}
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                                {formatPatientName(patient.surname, patient.name)}
                            </h1>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center">


                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-400 hover:text-slate-600 h-8 w-8"
                        onClick={() => pinDialog.openDialog('settings')}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                    <UpdateIndicator />

                    {/* Payment History Button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                        onClick={onOpenPaymentHistory}
                        title="Historique des paiements et créances"
                    >
                        <span className="text-lg">💳</span>
                    </Button>

                    {/* History Button (Symbol only) */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 h-8 w-8"
                        onClick={onOpenHistory}
                        title="Historique des consultations"
                    >
                        <span className="text-lg">📅</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => saveMutation.mutate({ finish: false })}
                    >
                        {saveMutation.isPending && !isFinishSheetOpen ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Sauvegarder
                        {isDirty && <span className="w-2 h-2 rounded-full bg-blue-500 ml-1" title="Modifications non sauvegardées" />}
                    </Button>

                    {showFinishButton && (
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                            onClick={onFinishConsultation}
                        >
                            <Save className="w-4 h-4" />
                            {consultationStatus === 'completed' ? 'Mettre a jour la consultation' : 'Terminer la consultation'}
                        </Button>
                    )}
                </div>
            </header>
        </>
    );
});
