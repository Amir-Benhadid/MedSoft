import { Loader2, Eye } from 'lucide-react';
import RefractionTab from './dashboard/RefractionTab';
import ClinicalExamTab from './dashboard/ClinicalExamTab';
import PatientInfoCard from './dashboard/PatientInfoCard';
import DocumentsContainer from './documents/DocumentsContainer';
import { FinishConsultationSheet } from './FinishConsultationSheet';
import { useDoctorDashboardLogic } from './dashboard/useDoctorDashboardLogic';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { ClinicalExamHeader } from './dashboard/ClinicalExamHeader';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { HistorySheet } from './history/HistorySheet';

interface DoctorDashboardProps {
    patientId: string;
    consultationId?: string;
    onBack?: () => void;
}

export default function DoctorDashboard({ patientId, consultationId, onBack }: DoctorDashboardProps) {
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
        handleSwitchConsultation,
        isActiveConsultationToday
    } = useDoctorDashboardLogic({ patientId, onBack, consultationId });

    const nextAppointmentData = useConsultationStore(state => state.clinicalExam.nextAppointment);

    if (isPatientLoading || (isConsultationLoading && !consultationData)) {
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
                onBack={onBack}
                saveMutation={saveMutation}
                setIsFinishSheetOpen={setIsFinishSheetOpen}
                isFinishSheetOpen={isFinishSheetOpen}
                onOpenHistory={() => setIsHistoryOpen(true)}
                showFinishButton={isActiveConsultationToday}
            />

            {/* Main Content - No Tabs, just Consultation View */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANE: Examinations (50%) */}
                <div className="flex-1 flex flex-col border-r bg-slate-50 h-full overflow-hidden">
                    {/* Top Section: Refraction */}
                    <div className="h-[50%] overflow-hidden border-b bg-white relative flex flex-col">
                        <div className="p-3 border-b bg-blue-50/30 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm bg-white/90">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <h3 className="font-medium text-slate-900">Réfraction</h3>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                            <RefractionTab />
                        </div>
                    </div>

                    {/* Bottom Section: Clinical Exam & Prescription */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
                        {/* Clinical Exam Header - OPTIMIZED: Isolated Component */}
                        <ClinicalExamHeader />

                        <div className="p-4 flex flex-col gap-6">
                            <ClinicalExamTab />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: Patient Info & Documents (50%) */}
                <div className="flex-1 flex flex-col bg-white h-full overflow-hidden border-l border-slate-200">
                    {/* Patient Info Card (Top) */}
                    <div className="bg-slate-50/50 p-4 border-b">
                        <PatientInfoCard readOnly={false} />
                    </div>

                    {/* Documents Container (Fill remaining space) */}
                    <div className="flex-1 overflow-hidden">
                        <DocumentsContainer />
                    </div>
                </div>
            </div>

            {/* Finish Consultation Sheet */}
            <FinishConsultationSheet
                isOpen={isFinishSheetOpen}
                onClose={() => setIsFinishSheetOpen(false)}
                onConfirm={(data) => saveMutation.mutate({ paymentData: data, finish: true })}
                patientId={patientId}
                nextAppointmentData={nextAppointmentData}
                consultationTypes={consultationTypes}
            />

            {/* History Sheet */}
            <HistorySheet
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                consultations={history}
                currentConsultationId={currentConsultationId}
                onSelectConsultation={handleSwitchConsultation}
            />
        </div>
    );
}


