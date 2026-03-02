import { useState } from "react";
import { Sheet, SheetContent } from "@/ui/components/ui/sheet";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import {
    VISUAL_ACUITY_OPTIONS_DISTANCE_SC
} from "@/ui/components/doctor/dashboard/types";
import { DocumentPrinter } from "../../doctor/documents/PrintingLogic";
import { Printer, Loader2, X, ChevronDown } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { useToast } from "@/ui/hooks/use-toast";

interface SecretaryCertificateSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
    patient?: any;
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) {
    const nativeOptions = options.map(o => ({
        ...o,
        value: o.value === '__EMPTY__' ? '' : o.value,
        label: o.value === '__EMPTY__' ? (placeholder || ' ') : o.label
    }));

    return (
        <div className={cn("relative w-full", className)}>
            <select
                className={cn(
                    "flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-background px-2 py-0 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-4",
                )}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
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

export function SecretaryCertificateContent({ onCancel, patientName, patient }: Omit<SecretaryCertificateSheetProps, 'open' | 'onOpenChange'> & { onCancel: () => void }) {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = useState(false);

    // Only fields relevant for the certificate
    const [formData, setFormData] = useState({
        // VA
        od_va: "", og_va: "",
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrintCertificate = async () => {
        if (!patient) return;
        setIsPrinting(true);
        try {
            const printOptions: any = {
                printControlFlags: {
                    includeVisualAcuityWithoutCorrection: true,
                    includeVisualAcuityWithCorrection: false,
                    includeGlassType: false
                },
                printDataOverrides: {
                    certificatAcuite: {
                        rightEye: {
                            visualAcuityVL_SC: formData.od_va,
                            // visualAcuityVL_AC: "", // Not capturing AC in this sheet
                            glassType: ""
                        },
                        leftEye: {
                            visualAcuityVL_SC: formData.og_va,
                            // visualAcuityVL_AC: "",
                            glassType: ""
                        }
                    }
                }
            };

            await DocumentPrinter.printDocument('certificatAcuite', patient, printOptions);
            toast({ title: "Succès", description: "Impression lancée", variant: "default" });

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
                    <h2 className="text-lg font-semibold text-slate-900">Certificat Minute - {patientName}</h2>
                    <p className="text-sm text-slate-500">
                        Générer un certificat sans enregistrement
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Acuité Visuelle */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-900 border-b pb-1">Acuité Visuelle</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {/* OD */}
                        <div className="flex items-center gap-2">
                            <Label className="w-8 text-right text-xs bg-blue-50 px-2 py-1 rounded text-blue-700 font-bold">OD</Label>
                            <CompactSelect placeholder="Acuité OD" value={formData.od_va} onChange={v => handleChange('od_va', v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} />
                        </div>

                        {/* OG */}
                        <div className="flex items-center gap-2">
                            <Label className="w-8 text-right text-xs bg-cyan-50 px-2 py-1 rounded text-cyan-700 font-bold">OG</Label>
                            <CompactSelect placeholder="Acuité OG" value={formData.og_va} onChange={v => handleChange('og_va', v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t mt-auto flex justify-end gap-2 bg-slate-50">
                <Button variant="outline" onClick={onCancel}>Fermer</Button>
                <Button onClick={handlePrintCertificate} disabled={isPrinting || (!formData.od_va && !formData.og_va)}>
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                    Imprimer Certificat
                </Button>
            </div>
        </div>
    );
}
