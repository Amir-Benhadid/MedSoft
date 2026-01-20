import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { Calendar, Activity, MapPin, Stethoscope, Phone, Mail, History, AlertCircle, Pill, ChevronRight, FlaskConical } from 'lucide-react';
import { UnifiedPatientItem } from './types';
import { formatDate, getAge } from './utils';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { Skeleton } from '@/ui/components/ui/skeleton';
import { cn } from '@/ui/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

interface PatientDetailsPanelProps {
    item: UnifiedPatientItem;
    onStartConsultation: (patientId: string, mode?: 'normal' | 'radiography') => void;
}

export default function PatientDetailsPanel({ item, onStartConsultation }: PatientDetailsPanelProps) {
    const { businessType } = useConfig();
    const isOphthalmology = businessType === "cabinet-ophthalmologie";
    const { data: consultationTypes = [] } = useConsultationTypes();

    // 1. Fetch Full Patient Details
    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ['patients', 'get', item.patientId],
        queryFn: () => orpcClient.patients.get({ id: item.patientId }),
    });

    // 2. Fetch Consultation History - including prescriptions
    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['consultations', 'history', item.patientId],
        queryFn: async () => {
            const list = await orpcClient.consultations.listByPatient({ patientId: item.patientId });
            return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        },
    });

    // Determine target mode based on consultation type
    const consultationType = consultationTypes.find(t => t.id === item.consultationTypeId);
    const targetMode = (consultationType?.nature === 'radiography') ? 'radiography' : 'normal';

    const isLoading = isPatientLoading || isHistoryLoading;
    const displayPatient = patient || item.patient;
    const validHistory = history?.filter(h => h.status === 'completed');

    return (
        <div className="w-1/2 flex flex-col h-full overflow-hidden bg-white border-l border-slate-200 shadow-xl z-20">
            {/* Simplified Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {displayPatient?.name} {displayPatient?.surname}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                                <Activity className="h-3 w-3 text-slate-400" />
                                {getAge(displayPatient?.dob)}
                            </span>
                            {displayPatient?.phone && (
                                <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    {displayPatient.phone}
                                </span>
                            )}
                            {displayPatient?.address?.city && (
                                <span className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    <MapPin className="h-3 w-3 text-slate-400" />
                                    {displayPatient.address.city}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => onStartConsultation(item.patientId, targetMode)}
                            className={cn(
                                "shadow-sm font-semibold h-9",
                                targetMode === 'radiography'
                                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                                    : "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                        >
                            {targetMode === 'radiography' ? (
                                <>
                                    <FlaskConical className="mr-2 h-4 w-4" />
                                    Consulter (Radio)
                                </>
                            ) : (
                                <>
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    Consulter
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Antecedents Summary - Compact */}
                {(displayPatient?.gen_ants || displayPatient?.oph_ants) && (
                    <div className="flex flex-wrap gap-2 text-xs">
                        {displayPatient?.oph_ants && displayPatient.oph_ants.split(',').map((ant: string, i: number) => (
                            <Badge key={`oph-${i}`} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-medium">
                                {ant.trim()}
                            </Badge>
                        ))}
                        {displayPatient?.gen_ants && displayPatient.gen_ants.split(',').map((ant: string, i: number) => (
                            <Badge key={`gen-${i}`} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-100 font-medium">
                                {ant.trim()}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Body */}
            <ScrollArea className="flex-1 bg-white">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-6 w-1/4 mt-4" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        {item.notes && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 text-amber-900 mx-1">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm font-medium">{item.notes}</div>
                            </div>
                        )}

                        {/* Recent History & Treatments */}
                        <section>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
                                Historique & Traitements
                            </h3>

                            <div className="flex flex-col gap-0 border rounded-xl overflow-hidden border-slate-200">
                                {!validHistory || validHistory.length === 0 ? (
                                    <div className="p-8 text-center bg-slate-50">
                                        <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 font-medium">Aucun historique disponible</p>
                                    </div>
                                ) : (
                                    validHistory.slice(0, 10).map((consultation, index) => {
                                        // safely access treatments
                                        const treatments = (consultation as any).prescription?.treatments;
                                        const hasTreatments = Array.isArray(treatments) && treatments.length > 0;
                                        const dateLabel = format(new Date(consultation.date), 'dd MMM yyyy', { locale: fr });

                                        return (
                                            <div
                                                key={consultation.id}
                                                className={cn(
                                                    "group p-4 bg-white hover:bg-slate-50 transition-colors flex flex-col gap-2",
                                                    index !== validHistory.length - 1 && "border-b border-slate-100"
                                                )}
                                            >
                                                {/* Header Line */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-800 text-sm">{consultation.type || 'Consultation'}</span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{dateLabel}</span>
                                                        </div>
                                                        {consultation.clinical_exam?.diagnosis && (
                                                            <div className="text-xs text-slate-600 mt-0.5 font-medium">
                                                                {consultation.clinical_exam.diagnosis}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Treatments Section */}
                                                {hasTreatments ? (
                                                    <div className="mt-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100/50">
                                                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            <Pill className="h-3 w-3" /> Traitements Prescrits
                                                        </div>
                                                        <div className="flex flex-col gap-1.5">
                                                            {treatments.map((t: any, idx: number) => (
                                                                <div key={idx} className="flex items-baseline gap-2 text-xs">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0 self-center" />
                                                                    <span className="font-semibold text-slate-700">{t.medication}</span>
                                                                    <span className="text-slate-500 text-[11px]">- {t.dosage || 'Dosage N/A'}</span>
                                                                    {t.duration && (
                                                                        <span className="text-slate-400 text-[10px]">
                                                                            ({typeof t.duration === 'string' ? t.duration : `${t.duration.value} ${t.duration.unit}`})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1">
                                                        <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                                                            <div className="h-px w-3 bg-slate-300" />
                                                            Aucun traitement prescrit
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
