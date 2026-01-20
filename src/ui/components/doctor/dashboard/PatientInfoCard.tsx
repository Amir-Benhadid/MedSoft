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
        <Card className="border-t-4 border-t-amber-500 shadow-sm mb-4">
            <CardContent className="p-4">
                {/* Header Row: Patient Basic Info */}
                <div className="flex flex-wrap items-center gap-6 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900">
                            {patient?.surname} {patient?.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="font-medium">{age}</span>
                    </div>

                    {patient?.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4 text-amber-500" />
                            <span className="text-sm">{patient.email}</span>
                        </div>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                        <Badge
                            onClick={handleDilationToggle}
                            className={cn(
                                "cursor-pointer select-none transition-colors px-3 py-1",
                                dilatationRequired
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"
                            )}
                            variant="outline"
                        >
                            <Eye className="w-3 h-3 mr-1.5" />
                            {dilatationRequired ? "Dilatation Requise / En Cours" : "Non Dilaté"}
                        </Badge>
                    </div>
                </div>

                {/* Clinical Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 h-full relative group">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Antécédents Généraux</Label>
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-amber-600"
                                disabled={readOnly}
                            >
                                <Maximize2 className="w-3 h-3" />
                            </button>
                        </div>
                        <SmartMultiSelectInput
                            category="antecedent_gen"
                            value={clinicalExam.generalMedicalHistory || ""}
                            onSelect={(val) => updateClinicalExamField("generalMedicalHistory", val)}
                            className="min-h-10 h-full bg-slate-50/50"
                            disabled={readOnly}
                            placeholder="Ajouter un antécédent..."
                        />
                    </div>

                    <div className="flex flex-col gap-1 h-full">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Diagnostic</Label>
                        <SmartMultiSelectInput
                            category="diagnostic"
                            value={clinicalExam.diagnosis || ""}
                            onSelect={(val) => updateClinicalExamField("diagnosis", val)}
                            className="min-h-10 h-full bg-slate-50/50 font-medium"
                            placeholder="Diagnostic..."
                        />
                    </div>

                    <div className="flex flex-col gap-1 h-full relative group">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Antécédents Ophtalmologiques</Label>
                            <button
                                type="button"
                                onClick={() => setIsDialogOpen(true)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-amber-600"
                                disabled={readOnly}
                            >
                                <Maximize2 className="w-3 h-3" />
                            </button>
                        </div>
                        <SmartMultiSelectInput
                            category="antecedent_oph"
                            value={clinicalExam.ophthalmologicalHistory || ""}
                            onSelect={(val) => updateClinicalExamField("ophthalmologicalHistory", val)}
                            className="min-h-10 h-full bg-slate-50/50"
                            disabled={readOnly}
                            placeholder="Ajouter un antécédent..."
                        />
                    </div>

                    <div className="flex flex-col gap-1 h-full">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profil</Label>
                        <OptimizedTextarea
                            value={clinicalExam.profile || ""}
                            onChange={(val) => updateClinicalExamField("profile", val)}
                            className="flex-1 resize-none bg-slate-50/50 min-h-10"
                            disabled={readOnly}
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
            </CardContent>
        </Card>
    );
}

export default memo(PatientInfoCard);

