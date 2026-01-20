import { Button } from "@/ui/components/ui/button";
import { Plus, Trash2, Pill } from "lucide-react";
import { OptimizedInput, OptimizedTextarea } from "@/ui/components/ui/optimized-input";
import { Label } from "@/ui/components/ui/label";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { MedicineAutocomplete } from "@/ui/components/doctor/medications/MedicineAutocomplete";
import { NewMedicineSheet } from "@/ui/components/doctor/medications/NewMedicineSheet";

interface PrescriptionTabProps {
    readOnly?: boolean;
}

export default function PrescriptionTab({ readOnly }: PrescriptionTabProps) {
    // Select prescription state and actions
    const treatments = useConsultationStore(state => state.prescriptions);
    const addTreatment = useConsultationStore(state => state.addPrescription);
    const updateTreatment = useConsultationStore(state => state.updatePrescription);
    const removeTreatment = useConsultationStore(state => state.removePrescription);

    return (
        <div className="h-full flex flex-col p-2 space-y-4">
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-blue-800 font-semibold">
                    <Pill className="w-5 h-5" />
                    Médicaments ({treatments.length})
                </div>
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        <NewMedicineSheet />
                        <Button size="sm" onClick={addTreatment} className="gap-2">
                            <Plus className="w-4 h-4" /> Ajouter
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {treatments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 border-2 border-dashed rounded-lg">
                        <Pill className="w-8 h-8 mb-2 opacity-50" />
                        <p>Aucun médicament prescrit</p>
                    </div>
                ) : (
                    treatments.map((t, index) => (
                        <div key={t.id} className="bg-white p-4 rounded-lg border shadow-sm relative group animate-in fade-in slide-in-from-top-2">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeTreatment(t.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-[30px_1fr] gap-4 mb-3">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mt-1">
                                    {treatments.length - index}
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Nom du médicament</Label>
                                            <MedicineAutocomplete
                                                value={t.name}
                                                onSelect={(med) => {
                                                    updateTreatment(t.id, 'name', med.medication_name);
                                                    if (med.strength || med.type) {
                                                        updateTreatment(t.id, 'dosage', [med.strength, med.type].filter(Boolean).join(' '));
                                                    }
                                                    if (med.instructions) {
                                                        updateTreatment(t.id, 'frequency', med.instructions);
                                                    }
                                                    if (med.packaging) {
                                                        updateTreatment(t.id, 'duration', med.packaging);
                                                    }
                                                }}
                                                className="h-8 text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Dosage</Label>
                                            <OptimizedInput
                                                value={t.dosage}
                                                onChange={(val) => updateTreatment(t.id, 'dosage', val)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Fréquence</Label>
                                            <OptimizedInput
                                                value={t.frequency}
                                                onChange={(val) => updateTreatment(t.id, 'frequency', val)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Durée</Label>
                                            <OptimizedInput
                                                value={t.duration}
                                                onChange={(val) => updateTreatment(t.id, 'duration', val)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-slate-500">Instructions</Label>
                                        <OptimizedTextarea
                                            value={t.instructions}
                                            onChange={(val) => updateTreatment(t.id, 'instructions', val)}
                                            className="h-16 text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
