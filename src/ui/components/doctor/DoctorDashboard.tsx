import { Loader2 } from 'lucide-react';
import RefractionTab from './dashboard/RefractionTab';
import TonometryTab from './dashboard/TonometryTab';
import ClinicalExamTab from './dashboard/ClinicalExamTab';
import PatientInfoCard from './dashboard/PatientInfoCard';
import DocumentsContainer from './documents/DocumentsContainer';
import { FinishConsultationSheet } from './FinishConsultationSheet';
import { useDoctorDashboardLogic } from './dashboard/useDoctorDashboardLogic';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { HistorySheet } from './history/HistorySheet';
import { PaymentHistorySheet } from './history/PaymentHistorySheet';
import { useState } from 'react';
import { useDocumentSync } from '@/ui/hooks/useDocumentSync';
import { useContactLensSync } from '@/ui/hooks/useContactLensSync';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';

interface DoctorDashboardProps {
    patientId: string;
    consultationId?: string;
    action?: 'view' | 'consultation';
    entrySource?: 'shared_record';
    onBack?: () => void;
}

export default function DoctorDashboard({ patientId, consultationId, action, entrySource, onBack }: DoctorDashboardProps) {
    const {
        patient,
        isPatientLoading,
        consultationData,
        isConsultationLoading,
        saveMutation,
        consultationTypes,
        isFinishSheetOpen,
        setIsFinishSheetOpen,
        // History
        isHistoryOpen,
        setIsHistoryOpen,
        history,
        currentConsultationId,
        currentConsultationStatus,
        isExcludedFromStats,
        handleSwitchConsultation,
        isActiveConsultationToday,
        hasAnyTodayConsultation,
        createConsultationMutation
    } = useDoctorDashboardLogic({ patientId, onBack, consultationId, action, entrySource });

    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
    const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
    const isDirty = useConsultationStore(state => state.isDirty);

    const handleBack = () => {
        if (isDirty) {
            setShowUnsavedPrompt(true);
        } else {
            onBack?.();
        }
    };

    const handleSaveAndLeave = () => {
        setShowUnsavedPrompt(false);
        saveMutation.mutate({ finish: false, leave: true });
    };

    const handleDiscardAndLeave = () => {
        setShowUnsavedPrompt(false);
        useConsultationStore.setState({ isDirty: false });
        onBack?.();
    };

    const handleFinishConsultation = () => {
        if (entrySource === 'shared_record' || isExcludedFromStats) {
            saveMutation.mutate({ finish: true });
            return;
        }

        setIsFinishSheetOpen(true);
    };

    useDocumentSync();
    useContactLensSync();

    const nextAppointmentData = useConsultationStore(state => state.clinicalExam.nextAppointment);

    if (isPatientLoading || isConsultationLoading || createConsultationMutation.isPending) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!patient) return <div>Patient introuvable</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Top Header - Patient Info & Global Actions */}
            <DashboardHeader
                patient={patient}
                onBack={handleBack}
                saveMutation={saveMutation}
                setIsFinishSheetOpen={setIsFinishSheetOpen}
                onFinishConsultation={handleFinishConsultation}
                isFinishSheetOpen={isFinishSheetOpen}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenPaymentHistory={() => setIsPaymentHistoryOpen(true)}
                showFinishButton={isActiveConsultationToday}
                consultationStatus={currentConsultationStatus}
            />

            {/* Main Content - No Tabs, just Consultation View */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 border-r min-h-0 grid grid-rows-[auto_auto_minmax(0,1fr)] overflow-y-auto">
                    {/* Top Section: Refraction (adapts to content) */}
                    <div className="border-b border-slate-200/50 bg-slate-50/50">
                        <div style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <RefractionTab patient={patient} />
                        </div>
                    </div>

                    {/* Middle Section: Tonometry (natural height) */}
                    <div className="border-b border-slate-200/50 bg-slate-50/50">
                        <div style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <TonometryTab />
                        </div>
                    </div>

                    {/* Bottom Section: Clinical Exam (3 parts of available height) */}
                    <div className="min-h-0 bg-slate-50/30">
                        <div className="h-full" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <ClinicalExamTab />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: Patient Info & Documents (50%) */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden border-l border-slate-200">
                    {/* Patient Info Card (Top) */}
                    <div className="flex-none border-b border-slate-200/50 bg-slate-50/50 overflow-hidden flex flex-col shrink-0">
                        <div style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <PatientInfoCard readOnly={false} />
                        </div>
                    </div>

                    {/* Documents Container (Fill remaining space) */}
                    <div className="flex-1 overflow-hidden bg-slate-50/30">
                        <div className="h-full" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <DocumentsContainer />
                        </div>
                    </div>
                </div>
            </div>

            {/* Finish Consultation Sheet */}
            <FinishConsultationSheet
                isOpen={isFinishSheetOpen}
                onClose={() => setIsFinishSheetOpen(false)}
                onConfirm={(data) => saveMutation.mutate({ paymentData: data, finish: true })}
                patientId={patientId}
                consultationId={currentConsultationId || undefined}
                consultationStatus={currentConsultationStatus || undefined}
                nextAppointmentData={nextAppointmentData}
                consultationTypes={consultationTypes}
            />

            <HistorySheet
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                consultations={history}
                currentConsultationId={currentConsultationId}
                onSelectConsultation={handleSwitchConsultation}
                onCreateConsultation={() => createConsultationMutation.mutate()}
                showCreate={!hasAnyTodayConsultation}
            />

            {/* Payment History Sheet */}
            <PaymentHistorySheet
                isOpen={isPaymentHistoryOpen}
                onOpenChange={setIsPaymentHistoryOpen}
                patientId={patientId}
            />

            {/* Unsaved Changes Confirmation Dialog */}
            <Dialog open={showUnsavedPrompt} onOpenChange={setShowUnsavedPrompt}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifications non enregistrées</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500 mt-2">
                            Voulez-vous enregistrer les modifications avant de quitter ?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-4 w-full">
                        <Button 
                            onClick={handleSaveAndLeave}
                            disabled={saveMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {saveMutation.isPending ? "Enregistrement..." : "Enregistrer et quitter"}
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDiscardAndLeave}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            Quitter sans enregistrer
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowUnsavedPrompt(false)}
                            className="w-full"
                        >
                            Annuler
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
