import { Loader2, Eye } from 'lucide-react';
import RefractionTab from './dashboard/RefractionTab';
import TonometryTab from './dashboard/TonometryTab';
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
                <div className="flex-1 flex flex-col border-r h-full overflow-hidden">
                    {/* Top Section: Refraction (Auto height based on content) */}
                    <div className="flex-none border-b border-slate-200/50 bg-slate-50/50 overflow-hidden flex flex-col shrink min-h-0 transition-all duration-300">
                        <div className="p-2 xl:p-3 2xl:p-5">
                            <RefractionTab patient={patient} />
                        </div>
                    </div>

                    {/* Middle Section: Tonometry (Auto height) */}
                    <div className="flex-none border-b border-slate-200/50 bg-slate-50/50 overflow-hidden flex flex-col shrink min-h-0 transition-all duration-300">
                        <div className="p-2 xl:p-3 2xl:p-5">
                            <TonometryTab />
                        </div>
                    </div>

                    {/* Bottom Section: Clinical Exam (Remaining space) */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/30 min-h-0">
                        <div className="p-2 xl:p-3 2xl:p-5 h-full">
                            <ClinicalExamTab />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: Patient Info & Documents (50%) */}
                <div className="flex-1 flex flex-col h-full overflow-hidden border-l border-slate-200">
                    {/* Patient Info Card (Top) */}
                    <div className="flex-none border-b border-slate-200/50 bg-slate-50/50 overflow-hidden flex flex-col shrink-0">
                        <div className="p-3">
                            <PatientInfoCard readOnly={false} />
                        </div>
                    </div>

                    {/* Documents Container (Fill remaining space) */}
                    <div className="flex-1 overflow-hidden bg-slate-50/30">
                        <div className="p-3 h-full">
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


