import { useMemo, useState, memo } from 'react';
import { Card, CardContent } from "@/ui/components/ui/card";
import { Label } from "@/ui/components/ui/label";
import { Badge } from "@/ui/components/ui/badge";
import { OptimizedInput, OptimizedTextarea } from "@/ui/components/ui/optimized-input";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { User, Calendar, Mail, Eye, Info, Maximize2, FileEdit, CheckCircle2 } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Textarea } from '@/ui/components/ui/textarea';
import { SmartAutocompleteInput } from '@/ui/components/shared/SmartAutocompleteInput';
import { SmartMultiSelectInput } from '@/ui/components/shared/SmartMultiSelectInput';

interface PatientInfoCardProps {
    readOnly?: boolean;
}

function PatientInfoCard({ readOnly }: PatientInfoCardProps) {
    const patient = useConsultationStore(state => state.patient);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const updateClinicalExamField = useConsultationStore(state => state.updateClinicalExamField);
    const dilatationRequired = useConsultationStore(state => state.dilatationRequired);
    const setDilatationRequired = useConsultationStore(state => state.setDilatationRequired);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const age = useMemo(() => {
        if (!patient?.dob) return 'N/A';
        const birthDate = new Date(patient.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} ans`;
    }, [patient?.dob]);

    const handleDilationToggle = () => {
        if (!readOnly) {
            setDilatationRequired(!dilatationRequired);
        }
    };

    return (
        <div className="flex flex-col rounded-lg border ring-1 shadow-sm overflow-hidden 2xl:shadow-md transition-all h-full bg-blue-50/80 border-blue-100 ring-blue-100">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/40 bg-white/30 backdrop-blur-[2px] flex items-center justify-between">
                <span className="text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Informations Patient
                </span>
            </div>

            {/* Content */}
            <div className="p-2 2xl:p-3 space-y-3 2xl:space-y-4 flex-1">
                {/* Row 1: Patient Details */}
                <div className="flex items-center gap-3 px-2 py-1.5 bg-white/70 backdrop-blur-sm rounded-lg border border-blue-100 shadow-sm">
                    <div className="p-1.5 2xl:p-2 bg-indigo-50 rounded-full ring-1 ring-indigo-100">
                        <User className="w-4 h-4 2xl:w-5 2xl:h-5 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-sm 2xl:text-base font-bold text-slate-800">
                            {patient?.surname} {patient?.name}
                        </h2>
                        <span className="text-xs 2xl:text-sm font-bold text-slate-400">
                            {age}
                        </span>
                    </div>

                    {patient?.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 ml-auto text-[11px] 2xl:text-xs">
                            <Mail className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                            <span className="font-medium">{patient.email}</span>
                        </div>
                    )}
                </div>

                {/* Row 2: Clinical Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 2xl:gap-3">
                    {/* Antécédents Généraux */}
                    <div className="flex flex-col gap-1 relative group bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-blue-100 shadow-sm hover:border-amber-200 transition-colors">
                        <div className="flex items-center justify-between px-1 mb-1">
                            <Label className="text-[9px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">Antécédents Généraux</Label>
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-amber-50 rounded text-amber-600"
                                disabled={readOnly}
                            >
                                <Maximize2 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                            </button>
                        </div>
                        <SmartMultiSelectInput
                            category="antecedent_gen"
                            value={clinicalExam.generalMedicalHistory || ""}
                            onSelect={(val) => updateClinicalExamField("generalMedicalHistory", val)}
                            className="min-h-[28px] 2xl:min-h-[36px] bg-slate-50/50 text-xs 2xl:text-sm font-medium border-slate-200 shadow-none focus-within:ring-2 focus-within:ring-amber-400/20"
                            disabled={readOnly}
                            placeholder="-"
                        />
                    </div>

                    {/* Diagnostic */}
                    <div className="flex flex-col gap-1 bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-blue-100 shadow-sm hover:border-blue-200 transition-colors">
                        <Label className="text-[9px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight px-1 mb-1">Diagnostic</Label>
                        <SmartMultiSelectInput
                            category="diagnostic"
                            value={clinicalExam.diagnosis || ""}
                            onSelect={(val) => updateClinicalExamField("diagnosis", val)}
                            className="min-h-[28px] 2xl:min-h-[36px] bg-slate-50/50 text-xs 2xl:text-sm font-bold text-slate-800 border-slate-200 shadow-none focus-within:ring-2 focus-within:ring-blue-400/20"
                            placeholder="-"
                        />
                    </div>

                    {/* Antécédents Ophtalmologiques */}
                    <div className="flex flex-col gap-1 relative group bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-blue-100 shadow-sm hover:border-amber-200 transition-colors">
                        <div className="flex items-center justify-between px-1 mb-1">
                            <Label className="text-[9px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">Antécédents Ophtalmologiques</Label>
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-amber-50 rounded text-amber-600"
                                disabled={readOnly}
                            >
                                <Maximize2 className="w-3 h-3 2xl:w-3.5 2xl:h-3.5" />
                            </button>
                        </div>
                        <SmartMultiSelectInput
                            category="antecedent_oph"
                            value={clinicalExam.ophthalmologicalHistory || ""}
                            onSelect={(val) => updateClinicalExamField("ophthalmologicalHistory", val)}
                            className="min-h-[28px] 2xl:min-h-[36px] bg-slate-50/50 text-xs 2xl:text-sm font-medium border-slate-200 shadow-none focus-within:ring-2 focus-within:ring-amber-400/20"
                            disabled={readOnly}
                            placeholder="-"
                        />
                    </div>

                    {/* Profil / Notes */}
                    <div className="flex flex-col gap-1 bg-white/70 backdrop-blur-sm p-2 rounded-lg border border-blue-100 shadow-sm">
                        <Label className="text-[9px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight px-1 mb-1">Note</Label>
                        <OptimizedTextarea
                            value={clinicalExam.profile || ""}
                            onChange={(val) => updateClinicalExamField("profile", val)}
                            className="flex-1 resize-none bg-slate-50/50 min-h-[28px] 2xl:min-h-[36px] h-auto text-xs 2xl:text-sm border-slate-200 shadow-none py-1.5 focus:ring-2 focus:ring-slate-400/20"
                            disabled={readOnly}
                            placeholder="-"
                        />
                    </div>
                </div>

                {/* Expanded Editing Dialog for Doctor */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden border-none shadow-2xl">
                        <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-amber-50 to-white border-b border-amber-100/50">
                            <DialogTitle className="flex items-center gap-3 text-slate-900">
                                <div className="p-2 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200">
                                    <FileEdit className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold">Modifier les Antécédents</span>
                                    <span className="text-xs font-normal text-slate-500 uppercase tracking-widest leading-none">Détails de l'Historique Médical</span>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="p-6 space-y-6 bg-white">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    Antécédents Ophtalmologiques
                                </label>
                                <SmartMultiSelectInput
                                    category="antecedent_oph"
                                    value={clinicalExam.ophthalmologicalHistory || ""}
                                    onSelect={(val) => updateClinicalExamField("ophthalmologicalHistory", val)}
                                    className="min-h-[140px] p-4 border-slate-200 focus:ring-2 focus:ring-amber-500/20 transition-all rounded-xl"
                                    placeholder="Glaucome, Cataracte, Chirurgies antérieures..."
                                    disabled={readOnly}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                    Antécédents Généraux
                                </label>
                                <SmartMultiSelectInput
                                    category="antecedent_gen"
                                    value={clinicalExam.generalMedicalHistory || ""}
                                    onSelect={(val) => updateClinicalExamField("generalMedicalHistory", val)}
                                    className="min-h-[140px] p-4 border-slate-200 focus:ring-2 focus:ring-amber-500/20 transition-all rounded-xl"
                                    placeholder="Diabète, HTA, Asthme, Allergies..."
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-4 bg-slate-50/80 border-t border-slate-100/80 flex items-center gap-2">
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2 h-auto rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 ml-auto"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Fermer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default memo(PatientInfoCard);

