import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/ui/components/ui/sheet";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/components/ui/alert-dialog";
import { orpcClient } from "@/ui/lib/orpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/ui/hooks/use-toast";
import { DocumentPrinter } from "../../doctor/documents/PrintingLogic";
import { Printer, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { useConfig } from "@/ui/contexts/ConfigContext";
import { getLocalTodayDate, getLocalISOString } from "@/ui/lib/time";
import {
    SPHERE_VALUES,
    CYLINDER_VALUES,
    AXIS_VALUES,
    ADD_VALUES,
    TENSION_VALUES,
    VISUAL_ACUITY_OPTIONS_DISTANCE_SC
} from "@/ui/components/doctor/dashboard/types";

interface ClinicalDataSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
    patient?: any;
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) {
    // Transform options for NativeSelect if they are empty
    const nativeOptions = options.map(o => ({
        ...o,
        value: o.value === '' ? '' : o.value,
        label: o.value === '' ? (placeholder || ' ') : o.label
    }));

    const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={cn("relative w-full", className)}>
            <select
                className={cn(
                    "flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-background px-2 py-0 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-4",
                )}
                value={value || ""}
                onChange={handleValueChange}
                disabled={disabled}
            >
                {nativeOptions.map((option) => (
                    <option key={`${option.value}-${option.label}`} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 opacity-50 pointer-events-none" />
        </div>
    );
}

export function ClinicalDataContent({ onCancel, onSuccess, patientId, patientName, patient, checkDirtyRef }: Omit<ClinicalDataSheetProps, 'open' | 'onOpenChange'> & { onCancel: () => void, onSuccess: () => void, checkDirtyRef?: React.MutableRefObject<(() => Promise<boolean>) | null> }) {
    const { appMode } = useConfig();
    const queryClient = useQueryClient();
    const today = getLocalTodayDate();
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = useState(false);

    // ... existing initialization code ...

    // State for form fields
    const initialFormState = {
        // Refraction OD
        od_sph: "", od_cyl: "", od_axis: "", od_add: "",
        // Refraction OG
        og_sph: "", og_cyl: "", og_axis: "", og_add: "",
        // VA & Tonometry
        od_va: "", og_va: "",
        od_iop: "", og_iop: "",
        od_pach: "", og_pach: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [initialData, setInitialData] = useState(initialFormState);

    // Fetch today's consultation
    const { data: consultations, isLoading: isLoadingConsultations } = useQuery({
        queryKey: ['consultations', patientId],
        queryFn: async () => await orpcClient.consultations.listByPatient({ patientId }),
        enabled: !!patientId,
    });

    const todayConsultation = consultations?.find(c => c.date.startsWith(today));

    // Update form when consultation loads
    const lastInitializedId = useRef<string | null>(null);

    useEffect(() => {
        if (todayConsultation && todayConsultation.id !== lastInitializedId.current) {
            const left = todayConsultation.left_eye || {};
            const right = todayConsultation.right_eye || {};

            const loadedData = {
                od_sph: right.sph || "",
                od_cyl: right.cyl || "",
                od_axis: right.axis || "",
                od_add: right.add || "",

                og_sph: left.sph || "",
                og_cyl: left.cyl || "",
                og_axis: left.axis || "",
                og_add: left.add || "",

                od_va: right.visualAcuityVL_SC || "",
                og_va: left.visualAcuityVL_SC || "",

                od_iop: right.tension || "",
                og_iop: left.tension || "",

                od_pach: right.pachymetry || "",
                og_pach: left.pachymetry || ""
            };

            setFormData(loadedData);
            setInitialData(loadedData);
            lastInitializedId.current = todayConsultation.id;
        }
    }, [todayConsultation]);

    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);


    const [showExitDialog, setShowExitDialog] = useState(false);

    // ... saveMutation ... (keeping as is in file, skipping replacement here to keep context focused)
    const saveMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                left_eye: {
                    sph: formData.og_sph, cyl: formData.og_cyl, axis: formData.og_axis, add: formData.og_add,
                    visualAcuityVL_SC: formData.og_va, tension: formData.og_iop, pachymetry: formData.og_pach
                },
                right_eye: {
                    sph: formData.od_sph, cyl: formData.od_cyl, axis: formData.od_axis, add: formData.od_add,
                    visualAcuityVL_SC: formData.od_va, tension: formData.od_iop, pachymetry: formData.od_pach
                }
            };

            if (todayConsultation) {
                // Update
                await orpcClient.consultations.update({
                    id: todayConsultation.id,
                    updates: payload
                });
            } else {
                // Create
                await orpcClient.consultations.create({
                    patient_id: patientId,
                    date: getLocalISOString(),
                    type: "Consultation",
                    status: "pending",
                    ...payload
                });
            }
        },
        onSuccess: () => {
            toast({
                title: "Succès",
                description: "Données cliniques enregistrées",
                variant: "default",
            });
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            onSuccess();
        },
        onError: () => {
            toast({
                title: "Erreur",
                description: "Erreur lors de l'enregistrement",
                variant: "destructive",
            });
        }
    });

    // Expose dirty check to parent
    useEffect(() => {
        if (checkDirtyRef) {
            checkDirtyRef.current = async () => {
                if (isDirty) {
                    if (window.confirm("Vous avez des modifications non enregistrées. Voulez-vous les enregistrer ?\n\nOK = Enregistrer et Fermer\nAnnuler = Fermer sans enregistrer")) {
                        await saveMutation.mutateAsync();
                        return true;
                    } else {
                        return true;
                    }
                }
                return true;
            };
        }
    }, [checkDirtyRef, isDirty, saveMutation]);

    const handleClose = async () => {
        if (isDirty) {
            setShowExitDialog(true);
        } else {
            onCancel();
        }
    };

    const handleDiscard = () => {
        setShowExitDialog(false);
        onCancel();
    };

    const handleSaveAndClose = async () => {
        setShowExitDialog(false);
        await saveMutation.mutateAsync();
    };

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrintCertificate = async () => {
        if (!patient) return;
        setIsPrinting(true);
        try {
            const printOptions: any = {
                leftEye: {
                    visualAcuityVL_SC: formData.og_va,
                    sph: formData.og_sph, cyl: formData.og_cyl, axis: formData.og_axis, add: formData.og_add,
                    tension: formData.og_iop, pachymetry: formData.og_pach
                },
                rightEye: {
                    visualAcuityVL_SC: formData.od_va,
                    sph: formData.od_sph, cyl: formData.od_cyl, axis: formData.od_axis, add: formData.od_add,
                    tension: formData.od_iop, pachymetry: formData.od_pach
                },
                prescriptions: [],
                clinicalExam: {},
                printControlFlags: {
                    includeVisualAcuityWithoutCorrection: true,
                    includeVisualAcuityWithCorrection: false,
                    includeGlassType: false
                },
                printDataOverrides: {
                    certificatAcuite: {
                        rightEye: {
                            visualAcuityVL_SC: formData.od_va,
                            glassType: ""
                        },
                        leftEye: {
                            visualAcuityVL_SC: formData.og_va,
                            glassType: ""
                        }
                    }
                }
            };

            await DocumentPrinter.printDocument('certificatAcuite', patient, printOptions);
        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible d'imprimer le certificat", variant: "destructive" });
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">Données Cliniques - {patientName}</h2>
                    <p className="text-sm text-slate-500">
                        Saisie rapide : Réfraction, Acuité Visuelle, Tonométrie
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Refraction */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-900 border-b pb-1">Réfraction Objective</h3>

                    {/* OD */}
                    <div className="grid grid-cols-5 gap-2 items-center">
                        <Label className="text-right text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 font-bold">OD</Label>
                        <CompactSelect placeholder="Sph" value={formData.od_sph} onChange={v => handleChange('od_sph', v)} options={SPHERE_VALUES} />
                        <CompactSelect placeholder="Cyl" value={formData.od_cyl} onChange={v => handleChange('od_cyl', v)} options={CYLINDER_VALUES} />
                        <CompactSelect placeholder="Axe" value={formData.od_axis} onChange={v => handleChange('od_axis', v)} options={AXIS_VALUES} />
                        <CompactSelect placeholder="Add" value={formData.od_add} onChange={v => handleChange('od_add', v)} options={ADD_VALUES} />
                    </div>

                    {/* OG */}
                    <div className="grid grid-cols-5 gap-2 items-center">
                        <Label className="text-right text-xs bg-cyan-50 px-2 py-1 rounded text-cyan-700 font-bold">OG</Label>
                        <CompactSelect placeholder="Sph" value={formData.og_sph} onChange={v => handleChange('og_sph', v)} options={SPHERE_VALUES} />
                        <CompactSelect placeholder="Cyl" value={formData.og_cyl} onChange={v => handleChange('og_cyl', v)} options={CYLINDER_VALUES} />
                        <CompactSelect placeholder="Axe" value={formData.og_axis} onChange={v => handleChange('og_axis', v)} options={AXIS_VALUES} />
                        <CompactSelect placeholder="Add" value={formData.og_add} onChange={v => handleChange('og_add', v)} options={ADD_VALUES} />
                    </div>
                </div>

                {/* VA & Tonometry */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-900 border-b pb-1">Acuité & Tonométrie</h3>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1"></div>
                        <Label className="text-center text-xs text-muted-foreground">AV (SC)</Label>
                        <Label className="text-center text-xs text-muted-foreground">PIO (mmHg)</Label>
                        <Label className="text-center text-xs text-muted-foreground">Pachy (µm)</Label>
                    </div>

                    {/* OD */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <Label className="text-right text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 font-bold">OD</Label>
                        <CompactSelect placeholder="-" value={formData.od_va} onChange={v => handleChange('od_va', v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} />
                        <CompactSelect placeholder="-" value={formData.od_iop} onChange={v => handleChange('od_iop', v)} options={TENSION_VALUES} />
                        <Input placeholder="550" value={formData.od_pach} onChange={e => handleChange('od_pach', e.target.value)} className="h-8 text-xs" />
                    </div>

                    {/* OG */}
                    <div className="grid grid-cols-4 gap-4 items-center">
                        <Label className="text-right text-xs bg-cyan-50 px-2 py-1 rounded text-cyan-700 font-bold">OG</Label>
                        <CompactSelect placeholder="-" value={formData.og_va} onChange={v => handleChange('og_va', v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} />
                        <CompactSelect placeholder="-" value={formData.og_iop} onChange={v => handleChange('og_iop', v)} options={TENSION_VALUES} />
                        <Input placeholder="550" value={formData.og_pach} onChange={e => handleChange('og_pach', e.target.value)} className="h-8 text-xs" />
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t mt-auto flex justify-end gap-2 bg-slate-50">
                <Button variant="outline" onClick={handleClose}>Annuler</Button>
                {(formData.od_va || formData.og_va) && (
                    <Button variant="outline" onClick={handlePrintCertificate} disabled={isPrinting}>
                        <Printer className="mr-2 h-4 w-4" />
                        Certificat
                    </Button>
                )}
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                </Button>
            </div>

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous avez des modifications en cours. Que souhaitez-vous faire ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowExitDialog(false)}>
                            Annuler
                        </Button>
                        <Button variant="outline" onClick={handleDiscard} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            Ne pas enregistrer
                        </Button>
                        <Button onClick={handleSaveAndClose}>
                            Enregistrer
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export function ClinicalDataSheet({ open, onOpenChange, patientId, patientName, patient }: ClinicalDataSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full p-0">
                <ClinicalDataContent
                    patientId={patientId}
                    patientName={patientName}
                    patient={patient}
                    onCancel={() => onOpenChange(false)}
                    onSuccess={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
