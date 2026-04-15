import { Loader2, Eye, FlaskConical } from 'lucide-react';
import PatientInfoCard from './dashboard/PatientInfoCard';
import DocumentsContainer from '@/ui/components/doctor/documents/DocumentsContainer';
import { FinishConsultationSheet } from './FinishConsultationSheet';
import { useDoctorDashboardLogic } from './dashboard/useDoctorDashboardLogic';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { HistorySheet } from './history/HistorySheet';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { ReadOnlyRefractionDisplay } from './dashboard/readonly/ReadOnlyRefractionDisplay';
import { ReadOnlyClinicalExamDisplay } from './dashboard/readonly/ReadOnlyClinicalExamDisplay';

interface DoctorDashboardProps {
    patientId: string;
    consultationId?: string;
    onBack?: () => void;
}

const RADIOGRAPHY_TABS = [
    'radiography',
    'medications', 'glasses', 'report', 'contacts', 'visualAcuity',
    'workStop', 'absence',
    'bilanPreOp', 'bilanDiabete', 'bilanCardio', 'bilanCnas', 'bilanCtf', 'bilanBiometrie', 'bilanInfectieux',
    'generic'
];

export default function RadiographyDashboard({ patientId, consultationId, onBack }: DoctorDashboardProps) {
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
        handleSwitchConsultation,
        isActiveConsultationToday
    } = useDoctorDashboardLogic({ patientId, onBack, mode: 'radiography', consultationId });

    const nextAppointmentData = useConsultationStore(state => state.clinicalExam.nextAppointment);

    // Fetch Last Completed Consultation for ReadOnly Left Panel
    const { data: lastConsultation } = useQuery({
        queryKey: ['consultations', 'last-completed', patientId],
        queryFn: async () => {
            const list = await orpcClient.consultations.listByPatient({ patientId });
            const completed = list
                .filter(c => c.status === 'completed')
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return completed[0] || null;
        },
        enabled: !!patientId,
    });

    if (isPatientLoading || (isConsultationLoading && !consultationData)) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
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
                onOpenPaymentHistory={() => { }}
                showFinishButton={isActiveConsultationToday}
                consultationStatus={currentConsultationStatus}
            />

            {/* Main Content - 50/50 Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANE: Read-Only Previous Data (50%) */}
                <div className="flex-1 flex flex-col border-r bg-slate-50 min-h-0 overflow-hidden">

                    {/* Top Section: Refraction (50%) */}
                    <div className="h-[50%] overflow-hidden border-b bg-white relative flex flex-col">
                        <div className="border-b bg-slate-50/50 flex items-center justify-between sticky top-0 z-10" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-slate-500" />
                                <h3 className="font-medium text-slate-700 text-sm">Réfraction (Précédente)</h3>
                            </div>
                            {lastConsultation && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                    {new Date(lastConsultation.date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto" style={{ padding: 'var(--dash-p)' }}>
                            <ReadOnlyRefractionDisplay
                                data={lastConsultation ? {
                                    leftEye: lastConsultation.left_eye,
                                    rightEye: lastConsultation.right_eye
                                } : undefined}
                            />
                        </div>
                    </div>

                    {/* Bottom Section: Clinical Exam (50%) */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col">
                        <div className="border-b bg-slate-50/50 flex items-center justify-between sticky top-0 z-10" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-slate-500" />
                                <h3 className="font-medium text-slate-700 text-sm">Examen Clinique (Précédent)</h3>
                            </div>
                        </div>
                        <div className="flex flex-col" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)', gap: 'var(--dash-gap)' }}>
                            <ReadOnlyClinicalExamDisplay
                                data={lastConsultation?.clinical_exam}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE: Active Documents Workspace (50%) */}
                <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden border-l border-slate-200">
                    {/* Patient Info Card (Top) */}
                    <div className="flex-none border-b border-slate-200/50 bg-slate-50/50 overflow-hidden flex flex-col shrink-0">
                        <div style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <PatientInfoCard readOnly={false} />
                        </div>
                    </div>

                    {/* Active Document Section */}
                    <div className="flex-1 overflow-hidden relative bg-slate-50/30">
                        <div className="h-full" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}>
                            <DocumentsContainer allowedTabs={RADIOGRAPHY_TABS} />
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
