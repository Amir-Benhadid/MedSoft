import { memo } from 'react';
import { EyeData, VISUAL_ACUITY_OPTIONS_DISTANCE_SC, VISUAL_ACUITY_OPTIONS_DISTANCE_AC, VISUAL_ACUITY_OPTIONS_NEAR, SPHERE_VALUES, CYLINDER_VALUES, AXIS_VALUES, ADD_VALUES, TENSION_VALUES, KERATOMETRY_VALUES, LENS_TYPE_OPTIONS, LENS_BRAND_OPTIONS, GLASS_TYPE_OPTIONS, CONTACT_LENS_TYPE_OPTIONS } from "./types";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Label } from "@/ui/components/ui/label";
import { NativeSelect } from "@/ui/components/ui/native-select";
import { Input } from "@/ui/components/ui/input";
import { Card, CardContent } from "@/ui/components/ui/card";
import { Separator } from "@/ui/components/ui/separator";
import { ChevronDown } from "lucide-react";

interface EyeRefractionPanelProps {
    side: "left" | "right";
    readOnly?: boolean;
    action?: React.ReactNode;
    data?: EyeData;
}

export const EyeRefractionPanel = memo(function EyeRefractionPanel({ side, readOnly, action, data: externalData }: EyeRefractionPanelProps) {
    const isRight = side === "right";
    const title = isRight ? "OD (Droit)" : "OG (Gauche)";
    const themeColor = isRight ? "text-green-600" : "text-blue-600";
    const borderColor = isRight ? "border-green-200" : "border-blue-200";
    const ringColor = isRight ? "focus-visible:ring-green-500" : "focus-visible:ring-blue-500";
    const badgeBg = isRight ? "bg-green-50" : "bg-blue-50";

    const storeData = useConsultationStore(state => isRight ? state.rightEye : state.leftEye);
    const updateField = useConsultationStore(state => isRight ? state.updateRightEyeField : state.updateLeftEyeField);

    // Use external data if provided, otherwise use store data
    const data = externalData || storeData;

    const handleChange = (field: keyof EyeData, value: string) => {
        if (readOnly) return;
        updateField(field, value);

        // Auto-sync Objective -> Subjective logic
        // Whenever an objective field changes, update the corresponding subjective field
        if (field === 'objSph') updateField('sph', value);
        if (field === 'objCyl') updateField('cyl', value);
        if (field === 'objAxis') updateField('axis', value);
        if (field === 'objAdd') updateField('add', value);

        // Auto-calc Corrected IOP (Ehlers Formula)
        // Corrected = Measured - (Pachymetry - 545) / 50 * 2.5
        if (field === 'tension' || field === 'pachymetry' || field === 'corrected_iop') {
            const currentTensionStr = field === 'tension' ? value : data.tension;
            const currentPachyStr = field === 'pachymetry' ? value : data.pachymetry;
            const currentCorrStr = field === 'corrected_iop' ? value : data.corrected_iop;

            const t = parseFloat(currentTensionStr || '0');
            const p = parseFloat(currentPachyStr || '0');
            const c = parseFloat(currentCorrStr || '0');

            if (p > 0) {
                // If Tension or Pachymetry changed -> Update Corrected
                if (field === 'tension' || field === 'pachymetry') {
                    if (t > 0) {
                        const corrected = t - ((p - 545) / 50 * 2.5);
                        updateField('corrected_iop', corrected.toFixed(0));
                    }
                }
                // If Corrected or Pachymetry changed -> Update Tension (Reverse Calc)
                // However, usually Pachy change drives Corrected calc. 
                // Let's say: If user TYPES in Corrected, we update Measured IOP.
                else if (field === 'corrected_iop') {
                    // Measured = Corrected + (Pachy - 545) / 50 * 2.5
                    const measured = c + ((p - 545) / 50 * 2.5);
                    // We need to round to nearest integer likely, or valid step?
                    // Let's use integer for now.
                    updateField('tension', measured.toFixed(0));
                }
            }
        }
    };

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden border-t-4 shadow-sm", isRight ? "border-t-green-500" : "border-t-blue-500")}>
            <div className={cn("px-3 py-2 border-b flex justify-between items-center min-h-[40px]", badgeBg)}>
                <span className={cn("font-bold text-sm", themeColor)}>{title}</span>
                {action && <div className="-my-1">{action}</div>}
            </div>

            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-0">
                <div className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-y-auto custom-scrollbar">
                    {/* Visual Acuity - Horizontal row for extreme compactness */}
                    <Section label="Acuité Visuelle">
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 items-center">
                            <span className="text-xs font-bold text-muted-foreground w-6">VL</span>
                            <div className="flex gap-2">
                                <CompactSelect
                                    value={data.visualAcuityVL_SC}
                                    onChange={(v) => handleChange("visualAcuityVL_SC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC}
                                    disabled={readOnly}
                                    placeholder="SC"
                                    className="flex-1"
                                />
                                <CompactSelect
                                    value={data.visualAcuityVL_AC}
                                    onChange={(v) => handleChange("visualAcuityVL_AC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_DISTANCE_AC}
                                    disabled={readOnly}
                                    placeholder="AC"
                                    className="flex-1"
                                />
                            </div>

                            <span className="text-xs font-bold text-muted-foreground w-6">VP</span>
                            <div className="flex gap-2">
                                <CompactSelect
                                    value={data.visualAcuityVP_SC}
                                    onChange={(v) => handleChange("visualAcuityVP_SC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_NEAR}
                                    disabled={readOnly}
                                    placeholder="SC"
                                    className="flex-1"
                                />
                                <CompactSelect
                                    value={data.visualAcuityVP_AC}
                                    onChange={(v) => handleChange("visualAcuityVP_AC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_NEAR}
                                    disabled={readOnly}
                                    placeholder="AC"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </Section>

                    <Separator className="my-0.5" />

                    {/* Refraction Grid - Takes less priority space */}
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        <Section label="Réfraction Obj.">
                            <RefractionFields
                                prefix="obj"
                                data={data}
                                onChange={handleChange}
                                readOnly={readOnly}
                            />
                        </Section>
                        <Section label="Réfraction Subj.">
                            <RefractionFields
                                prefix=""
                                data={data}
                                onChange={handleChange}
                                readOnly={readOnly}
                            />
                        </Section>
                    </div>

                    <Separator className="my-0.5" />

                    {/* Additional Data: Correctin & Kerato - Moved Up & Adaptive */}
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        <div className={cn("p-2 rounded-md border bg-slate-50/50 flex flex-col justify-center", borderColor)}>
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Kérato</Label>
                            <div className="grid grid-cols-2 gap-1">
                                <Field label="K1">
                                    <CompactSelect
                                        value={data.k1}
                                        onChange={(v) => handleChange("k1", v)}
                                        options={KERATOMETRY_VALUES}
                                        disabled={readOnly}
                                        placeholder="-"
                                    />
                                </Field>
                                <Field label="K2">
                                    <CompactSelect
                                        value={data.k2}
                                        onChange={(v) => handleChange("k2", v)}
                                        options={KERATOMETRY_VALUES}
                                        disabled={readOnly}
                                        placeholder="-"
                                    />
                                </Field>
                            </div>
                        </div>

                        <div className={cn("p-2 rounded-md border bg-slate-50/50 flex flex-col justify-center", borderColor)}>
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Correction</Label>
                            <div className="space-y-2 w-full">
                                <div className="grid grid-cols-2 gap-1">
                                    <Field label="Verre">
                                        <CompactSelect
                                            value={data.glassType}
                                            onChange={(v) => handleChange("glassType", v)}
                                            options={GLASS_TYPE_OPTIONS}
                                            disabled={readOnly}
                                            placeholder="-"
                                        />
                                    </Field>
                                    <Field label="Lentille">
                                        <CompactSelect
                                            value={data.contactLensType}
                                            onChange={(v) => handleChange("contactLensType", v)}
                                            options={CONTACT_LENS_TYPE_OPTIONS}
                                            disabled={readOnly}
                                            placeholder="-"
                                        />
                                    </Field>
                                </div>
                                {/* Hidden fields unless needed to save space, assuming high density desired */}
                                <div className="grid grid-cols-2 gap-1">
                                    <Field label="Modèle">
                                        <CompactSelect
                                            value={data.lensType}
                                            onChange={(v) => handleChange("lensType", v)}
                                            options={LENS_TYPE_OPTIONS}
                                            disabled={readOnly}
                                            placeholder="-"
                                        />
                                    </Field>
                                    <Field label="Marque">
                                        <CompactSelect
                                            value={data.lensBrand}
                                            onChange={(v) => handleChange("lensBrand", v)}
                                            options={LENS_BRAND_OPTIONS}
                                            disabled={readOnly}
                                            placeholder="-"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-0.5" />

                    {/* Tonometry - Moves to bottom, fills remaining space if any */}
                    {/* Tonometry - Moves to bottom, fills remaining space if any */}
                    <div className="flex-1 flex flex-col justify-end min-h-0">
                        <Section label="Tonométrie">
                            <div className="flex gap-2">
                                <Field label="PIO" className="flex-1">
                                    <CompactSelect
                                        value={data.tension}
                                        onChange={(v) => handleChange("tension", v)}
                                        options={TENSION_VALUES}
                                        disabled={readOnly}
                                        placeholder="-"
                                    />
                                </Field>
                                <Field label="PIO Corr." className="flex-1">
                                    <Input
                                        value={data.corrected_iop || ""}
                                        onChange={(e) => handleChange("corrected_iop", e.target.value)}
                                        disabled={readOnly}
                                        className="h-8 text-xs px-2"
                                    />
                                </Field>
                                <Field label="Applanat." className="flex-1">
                                    <Input
                                        value={data.tensionApplanation || ""}
                                        onChange={(e) => handleChange("tensionApplanation", e.target.value)}
                                        disabled={readOnly}
                                        className="h-8 text-xs px-2"
                                    />
                                </Field>
                                <Field label="Pachy" className="flex-1">
                                    <Input
                                        value={data.pachymetry || ""}
                                        onChange={(e) => handleChange("pachymetry", e.target.value)}
                                        disabled={readOnly}
                                        className="h-8 text-xs px-2"
                                    />
                                </Field>
                                <Field label="Heure" className="flex-1">
                                    <input
                                        type="time"
                                        value={data.tensionTime || ""}
                                        onChange={(e) => handleChange("tensionTime", e.target.value)}
                                        disabled={readOnly}
                                        className="h-8 w-full text-xs bg-white border border-input rounded-md px-2 focus:ring-1 focus:ring-ring"
                                    />
                                </Field>
                            </div>
                        </Section>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

// Subcomponents

function Section({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</Label>
            {children}
        </div>
    );
}

function Field({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-0.5 w-full", className)}>
            {label && <Label className="text-[10px] text-muted-foreground font-medium block mb-0.5 truncate">{label}</Label>}
            {children}
        </div>
    );
}

function RefractionFields({
    prefix,
    data,
    onChange,
    readOnly
}: {
    prefix: string;
    data: EyeData;
    onChange: (field: keyof EyeData, value: string) => void;
    readOnly?: boolean;
}) {
    const fields = [
        { label: "Sph", key: prefix ? "objSph" : "sph", options: SPHERE_VALUES },
        { label: "Cyl", key: prefix ? "objCyl" : "cyl", options: CYLINDER_VALUES },
        { label: "Axe", key: prefix ? "objAxis" : "axis", options: AXIS_VALUES },
        { label: "Add", key: prefix ? "objAdd" : "add", options: ADD_VALUES },
    ];

    return (
        <div className="space-y-1">
            {fields.map((f) => (
                <div key={f.key} className="grid grid-cols-[28px_1fr] gap-2 items-center">
                    <Label className="text-[10px] font-medium text-slate-600">{f.label}</Label>
                    <CompactSelect
                        value={(data as any)[f.key] || ""}
                        onChange={(val: string) => onChange(f.key as any, val)}
                        options={f.options}
                        disabled={readOnly}
                        placeholder="-"
                    />
                </div>
            ))}
        </div>
    );
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) {
    // Transform options for NativeSelect if they contain __EMPTY__
    const nativeOptions = options.map(o => ({
        ...o,
        value: o.value === '__EMPTY__' ? '' : o.value,
        label: o.value === '__EMPTY__' ? (placeholder || ' ') : o.label
    }));

    const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onChange(val === '' ? '__EMPTY__' : val);
    };

    return (
        <div className={cn("relative w-full", className)}>
            <select
                className={cn(
                    "flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-background px-2 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-6",
                )}
                value={value === '__EMPTY__' ? '' : (value || '')}
                onChange={handleValueChange}
                disabled={disabled}
            >
                {nativeOptions.map((option) => (
                    <option key={`${option.value}-${option.label}`} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-3 opacity-50 pointer-events-none" />
        </div>
    );
}
