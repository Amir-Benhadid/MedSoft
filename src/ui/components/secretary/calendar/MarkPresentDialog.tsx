import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/components/ui/dialog";
import { Button } from "@/ui/components/ui/button";
import { Label } from "@/ui/components/ui/label";
import { Textarea } from "@/ui/components/ui/textarea";
import { Switch } from "@/ui/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/components/ui/select";
import { Badge } from "@/ui/components/ui/badge";
import { Appointment, useMarkPresent, useToggleDilation, useUpdateAppointment } from "@/ui/hooks/useAppointments";
import { usePatient, useUpdatePatient } from "@/ui/hooks/usePatients";
import { useConfig } from "@/ui/contexts/ConfigContext";
import { Eye, Activity, Save, CheckCircle, Droplet, FileText } from "lucide-react";
import { getLocalISOString } from "@/ui/lib/time";
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';
import { cn } from "@/ui/lib/utils";
import { useSheetStack } from "@/ui/components/ui/sheet-stack";
import { ClinicalDataContent } from "@/ui/components/secretary/patient/ClinicalDataSheet";
import { SecretaryDocumentsContent } from "@/ui/components/secretary/sheet/SecretaryDocumentsSheet";

interface MarkPresentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
}

const DILATION_PRODUCTS = [
    { value: 'Tropicamyde', label: 'Tropi', short: 'T', color: 'bg-blue-500' },
    { value: 'Mydriaticum', label: 'Mydri', short: 'M', color: 'bg-cyan-500' },
    { value: 'Skiacol', label: 'Skia', short: 'S', color: 'bg-indigo-500' },
    { value: 'Atropine', label: 'Atro', short: 'A', color: 'bg-purple-500' },
] as const;

export function MarkPresentDialog({ isOpen, onClose, appointment }: MarkPresentDialogProps) {
    const { appMode, businessType } = useConfig();
    const isOphthalmology = businessType === 'cabinet-ophthalmologie';

    // Hooks
    const markPresent = useMarkPresent();
    const toggleDilation = useToggleDilation();
    const updateAppointment = useUpdateAppointment();
    const updatePatient = useUpdatePatient();

    // Patient Data
    const { data: patient, isLoading: isPatientLoading } = usePatient(appointment?.patient_id || null);

    // Local State
    const { data: consultationTypes = [] } = useConsultationTypes();
    const [ophAnts, setOphAnts] = useState("");
    const [genAnts, setGenAnts] = useState("");
    const [needsDilation, setNeedsDilation] = useState(false);
    const [dilationStatus, setDilationStatus] = useState<string>("");
    const [consultationTypeId, setConsultationTypeId] = useState<string>("1");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { openSheet, closeSheet, sheets } = useSheetStack();
    const clinicalDirtyRef = useRef<(() => Promise<boolean>) | null>(null);
    const activeSheetRef = useRef<'clinical' | 'documents' | null>(null);

    const handleOpenClinicalData = async () => {
        if (!patient) return;

        // Clean up documents if open
        if (activeSheetRef.current === 'documents') {
            closeSheet('documents');
        } else if (activeSheetRef.current === 'clinical') {
            return; // Already open
        }

        activeSheetRef.current = 'clinical';
        openSheet(
            <ClinicalDataContent
                patientId={patient.id}
                patientName={`${patient.surname} ${patient.name}`}
                onCancel={() => {
                    closeSheet('clinical-data');
                    activeSheetRef.current = null;
                }}
                onSuccess={() => {
                    closeSheet('clinical-data');
                    activeSheetRef.current = null;
                }}
                checkDirtyRef={clinicalDirtyRef}
            />,
            { id: 'clinical-data', width: 500, title: 'Données Cliniques', onDismiss: () => { activeSheetRef.current = null; } }
        );
    };

    const handleOpenDocuments = async () => {
        if (!patient) return;

        // Check if clinical is dirty before switching
        if (activeSheetRef.current === 'clinical') {
            if (clinicalDirtyRef.current) {
                const canClose = await clinicalDirtyRef.current();
                if (!canClose) return; // User cancelled
            }
            closeSheet('clinical-data');
        } else if (activeSheetRef.current === 'documents') {
            return;
        }

        activeSheetRef.current = 'documents';
        openSheet(
            <SecretaryDocumentsContent
                patientId={patient.id}
                patientName={`${patient.surname} ${patient.name}`}
                patient={patient}
                onClose={() => {
                    closeSheet('documents');
                    activeSheetRef.current = null;
                }}
            />,
            { id: 'documents', width: 500, title: 'Documents', onDismiss: () => { activeSheetRef.current = null; } }
        );
    };

    // Sync state with patient data
    useEffect(() => {
        if (isOpen && patient) {
            setOphAnts(patient.oph_ants || "");
            setGenAnts(patient.gen_ants || "");
        }
    }, [isOpen, patient]);

    // Sync state with appointment data
    useEffect(() => {
        if (isOpen && appointment) {
            setNeedsDilation(appointment.needs_dilation);
            setDilationStatus(appointment.dilation_status || "");
            setConsultationTypeId(appointment.consultation_type_id ? appointment.consultation_type_id.toString() : "1");
        }
    }, [isOpen, appointment]);

    const handleConfirm = async () => {
        if (!appointment || !patient) return;
        setIsSubmitting(true);

        try {
            // 1. Update Patient Antecedents if changed
            const hasAntecedentsChanged = ophAnts !== (patient.oph_ants || "") || genAnts !== (patient.gen_ants || "");

            if (hasAntecedentsChanged) {
                await updatePatient.mutateAsync({
                    id: patient.id,
                    updates: {
                        oph_ants: ophAnts,
                        gen_ants: genAnts
                    }
                });
            }

            // 2. Handle Dilation Changes
            // If needsDilation changed OR if product changed (and dilation is needed)
            if (appointment.needs_dilation !== needsDilation) {
                await toggleDilation.mutateAsync({
                    id: appointment.id,
                    needsDilation: needsDilation
                });
            }

            // If dilation is active, ensure we update the product string
            if (needsDilation && dilationStatus !== appointment.dilation_status) {
                await updateAppointment.mutateAsync({
                    id: appointment.id,
                    updates: {
                        dilation_status: dilationStatus
                    }
                });
            }

            // Update consultation type if changed
            if (consultationTypeId && parseInt(consultationTypeId) !== appointment.consultation_type_id) {
                await updateAppointment.mutateAsync({
                    id: appointment.id,
                    updates: {
                        consultation_type_id: parseInt(consultationTypeId)
                    }
                });
            }

            // 3. Mark Present
            await markPresent.mutateAsync({
                id: appointment.id,
                arrivedAt: getLocalISOString()
            });

            onClose();
        } catch (error) {
            console.error("Failed to mark present:", error);
            // potentially show toast error here
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!appointment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                // If any sheet is open in the stack, we don't want to close the dialog
                // as the user might be clicking on a sheet or its overlay.
                if (sheets.length > 0) return;
                onClose();
            }
        }}>
            <DialogContent 
                className="sm:max-w-[500px] bg-white"
                onInteractOutside={(e) => {
                    // Prevent closing the dialog if sheets are open
                    if (sheets.length > 0) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        Marquer comme présent
                    </DialogTitle>
                    <DialogDescription>
                        Vérifiez les antécédents et confirmez l'arrivée de <strong>{appointment.title}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Consultation Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                            <Activity className="w-4 h-4 text-slate-500" />
                            Type de consultation
                        </Label>
                        <Select
                            value={consultationTypeId}
                            onValueChange={setConsultationTypeId}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                {consultationTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.label} - {type.amount} DA
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dilation Switch (Only for Ophthalmology) */}
                    {isOphthalmology && (
                        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-blue-50/50 border-blue-100 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label htmlFor="dilation-mode" className="text-base font-medium text-slate-900">
                                            Nécessite une dilatation
                                        </Label>
                                        <p className="text-xs text-slate-500">
                                            Ajouter à la liste d'attente de dilatation
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="dilation-mode"
                                    checked={needsDilation}
                                    onCheckedChange={setNeedsDilation}
                                />
                            </div>

                            {/* Medication Selector - Visible only when dilation is checked */}

                            <div className={cn(
                                "transition-all duration-300 pl-[3.25rem]",
                                needsDilation ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                            )}>
                                <Select value={dilationStatus} onValueChange={setDilationStatus} disabled={!needsDilation}>
                                    <SelectTrigger className="w-full bg-white border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <Droplet className="h-4 w-4 text-blue-500" />
                                            <SelectValue placeholder="Choisir le produit..." />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DILATION_PRODUCTS.map((product) => (
                                            <SelectItem key={product.value} value={product.value}>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn("text-white h-5 w-5 p-0 flex items-center justify-center text-[10px]", product.color)}>
                                                        {product.short}
                                                    </Badge>
                                                    <span className="font-medium text-sm">{product.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-auto flex-col gap-1 py-3 border-dashed border-teal-200 bg-teal-50/30 hover:bg-teal-50 text-teal-700"
                            onClick={handleOpenClinicalData}
                            disabled={isPatientLoading}
                        >
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-medium">Données Cliniques</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-auto flex-col gap-1 py-3 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                            onClick={handleOpenDocuments}
                            disabled={isPatientLoading}
                        >
                            <FileText className="w-4 h-4" />
                            <span className="text-[10px] font-medium">Documents</span>
                        </Button>
                    </div>

                    {/* Antecedents Section */}
                    <div className="space-y-4">
                        {isOphthalmology && (
                            <div className="space-y-2">
                                <Label htmlFor="oph-ants" className="text-slate-700 font-semibold flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-slate-500" />
                                    Antécédents Ophtalmologiques
                                </Label>
                                <Textarea
                                    id="oph-ants"
                                    placeholder="Glaucome, cataracte, chirurgie réfractive..."
                                    className="min-h-[80px] resize-none focus-visible:ring-blue-500"
                                    value={ophAnts}
                                    onChange={(e) => setOphAnts(e.target.value)}
                                    disabled={isPatientLoading}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="gen-ants" className="text-slate-700 font-semibold flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-500" />
                                Antécédents Généraux
                            </Label>
                            <Textarea
                                id="gen-ants"
                                placeholder="Diabète, hypertension, allergies..."
                                className="min-h-[80px] resize-none focus-visible:ring-blue-500"
                                value={genAnts}
                                onChange={(e) => setGenAnts(e.target.value)}
                                disabled={isPatientLoading}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting || isPatientLoading}
                        className={cn(
                            "bg-green-600 hover:bg-green-700 text-white gap-2",
                            isSubmitting && "opacity-80 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Confirmer la présence
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
