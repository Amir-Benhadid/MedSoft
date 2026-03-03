import { useState, useEffect } from "react";
import { Button } from "@/ui/components/ui/button";
import { Input } from "@/ui/components/ui/input";
import { Label } from "@/ui/components/ui/label";
import { Sheet, SheetContent } from "@/ui/components/ui/sheet";
import {
    VISUAL_ACUITY_OPTIONS_DISTANCE_SC
} from "@/ui/components/doctor/dashboard/types";
import { DocumentPrinter } from "../../doctor/documents/PrintingLogic";
import { Printer, Loader2, X, ChevronDown, User } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { useToast } from "@/ui/hooks/use-toast";
import { format, differenceInYears, isValid, parse } from "date-fns";

interface GuestCertificateSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) {
    const nativeOptions = options.map(o => ({
        ...o,
        value: o.value === '' ? '' : o.value,
        label: o.value === '' ? (placeholder || ' ') : o.label
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

export function GuestCertificateSheet({ open, onOpenChange }: GuestCertificateSheetProps) {
    const { toast } = useToast();
    const [isPrinting, setIsPrinting] = useState(false);

    const [form, setForm] = useState({
        surname: "", // Nom
        name: "",    // Prénom
        dob: "",     // YYYY-MM-DD
        age: "",
        od_va: "",
        og_va: ""
    });

    // Handle Age change -> Update DOB (Approximate)
    const handleAgeChange = (ageVal: string) => {
        setForm(prev => ({ ...prev, age: ageVal }));
        if (ageVal && !isNaN(Number(ageVal))) {
            const year = new Date().getFullYear() - Number(ageVal);
            // Default to Jan 1st
            setForm(prev => ({ ...prev, age: ageVal, dob: `${year}-01-01` }));
        }
    };

    // Handle DOB change -> Update Age
    const handleDobChange = (dobVal: string) => {
        setForm(prev => ({ ...prev, dob: dobVal }));
        const date = new Date(dobVal);
        if (isValid(date)) {
            const ageComp = differenceInYears(new Date(), date);
            setForm(prev => ({ ...prev, dob: dobVal, age: ageComp.toString() }));
        }
    };

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handlePrintCertificate = async () => {
        if (!form.surname || !form.name || !form.dob) {
            toast({ title: "Erreur", description: "Veuillez remplir les informations du patient", variant: "destructive" });
            return;
        }

        setIsPrinting(true);
        try {
            // Construct a temporary patient object
            const tempPatient = {
                id: "guest",
                surname: form.surname.toUpperCase(),
                name: form.name,
                dob: form.dob,
                sex: "M", // Default, or add field if needed. Not critical for acuity cert.
            };

            const printOptions: any = {
                printControlFlags: {
                    includeVisualAcuityWithoutCorrection: true,
                    includeVisualAcuityWithCorrection: false,
                    includeGlassType: false
                },
                printDataOverrides: {
                    certificatAcuite: {
                        rightEye: {
                            visualAcuityVL_SC: form.od_va,
                            glassType: ""
                        },
                        leftEye: {
                            visualAcuityVL_SC: form.og_va,
                            glassType: ""
                        }
                    }
                }
            };

            await DocumentPrinter.printDocument('certificatAcuite', tempPatient, printOptions);
            toast({ title: "Succès", description: "Impression lancée", variant: "default" });
            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast({ title: "Erreur", description: "Impossible d'imprimer le certificat", variant: "destructive" });
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md w-full p-0 bg-white">
                <div className="h-full flex flex-col">
                    <div className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-slate-50/50">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <User className="h-5 w-5 text-slate-500" />
                                Certificat Externe
                            </h2>
                            <p className="text-xs text-slate-500">
                                Patient non enregistré en base de données
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                        {/* Patient Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-slate-900 border-b pb-1">Informations Patient</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500">Nom</Label>
                                    <Input
                                        value={form.surname}
                                        onChange={e => handleChange('surname', e.target.value)}
                                        placeholder="NOM"
                                        className="uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500">Prénom</Label>
                                    <Input
                                        value={form.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        placeholder="Prénom"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500">Date de naissance</Label>
                                    <Input
                                        type="date"
                                        value={form.dob}
                                        onChange={e => handleDobChange(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-500">Âge (approx.)</Label>
                                    <Input
                                        type="number"
                                        value={form.age}
                                        onChange={e => handleAgeChange(e.target.value)}
                                        placeholder="Ex: 30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Acuity */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-slate-900 border-b pb-1">Acuité Visuelle</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-blue-700">OD (Droit)</Label>
                                    <CompactSelect
                                        placeholder="Acuité OD"
                                        value={form.od_va}
                                        onChange={v => handleChange('od_va', v)}
                                        options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-cyan-700">OG (Gauche)</Label>
                                    <CompactSelect
                                        placeholder="Acuité OG"
                                        value={form.og_va}
                                        onChange={v => handleChange('og_va', v)}
                                        options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t mt-auto flex justify-end gap-2 bg-slate-50">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button onClick={handlePrintCertificate} disabled={isPrinting || !form.surname || !form.name || (!form.od_va && !form.og_va)}>
                            {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                            Imprimer
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
