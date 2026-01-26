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
    const themeColor = isRight ? "text-green-700" : "text-blue-700";
    const borderColor = isRight ? "border-green-300" : "border-blue-300";
    const ringColor = isRight ? "focus-visible:ring-green-500" : "focus-visible:ring-blue-500";
    const badgeBg = isRight ? "bg-green-100" : "bg-blue-100";

    const storeData = useConsultationStore(state => isRight ? state.rightEye : state.leftEye);
    const updateField = useConsultationStore(state => isRight ? state.updateRightEyeField : state.updateLeftEyeField);

    // Use external data if provided, otherwise use store data
    const data = externalData || storeData;

    const handleChange = (field: keyof EyeData, value: string) => {
        if (readOnly) return;
        updateField(field, value);

        if (field === 'objSph') updateField('sph', value);
        if (field === 'objCyl') updateField('cyl', value);
        if (field === 'objAxis') updateField('axis', value);
        if (field === 'objAdd') updateField('add', value);

        if (field === 'tension' || field === 'pachymetry' || field === 'corrected_iop') {
            const currentTensionStr = field === 'tension' ? value : data.tension;
            const currentPachyStr = field === 'pachymetry' ? value : data.pachymetry;
            const currentCorrStr = field === 'corrected_iop' ? value : data.corrected_iop;
            const t = parseFloat(currentTensionStr || '0');
            const p = parseFloat(currentPachyStr || '0');
            const c = parseFloat(currentCorrStr || '0');

            if (p > 0) {
                if (field === 'tension' || field === 'pachymetry') {
                    if (t > 0) {
                        const corrected = t - ((p - 545) / 50 * 2.5);
                        updateField('corrected_iop', corrected.toFixed(0));
                    }
                } else if (field === 'corrected_iop') {
                    const measured = c + ((p - 545) / 50 * 2.5);
                    updateField('tension', measured.toFixed(0));
                }
            }
        }
    };

    return (
        <Card className={cn("h-full flex flex-col overflow-hidden border-t-4 shadow-md", isRight ? "border-t-green-500" : "border-t-blue-500")}>
            <div className={cn("px-4 py-3 border-b flex justify-between items-center min-h-[48px]", badgeBg)}>
                <span className={cn("font-bold text-base", themeColor)}>{title}</span>
                {action && <div className="-my-1">{action}</div>}
            </div>

            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col min-h-0 bg-white">
                <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">

                    {/* Visual Acuity Row */}
                    <div className="flex items-center gap-4">
                        <LabelBox label="Acuité" />
                        <div className="flex-1 grid grid-cols-[auto_1fr_auto_1fr] gap-3 items-center">
                            <span className="text-sm font-bold text-slate-700 w-6">VL</span>
                            <div className="flex gap-2">
                                <CompactSelect
                                    value={data.visualAcuityVL_SC}
                                    onChange={(v) => handleChange("visualAcuityVL_SC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC}
                                    disabled={readOnly}
                                    placeholder="SC"
                                    className="flex-1 h-10 text-base"
                                />
                                <CompactSelect
                                    value={data.visualAcuityVL_AC}
                                    onChange={(v) => handleChange("visualAcuityVL_AC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_DISTANCE_AC}
                                    disabled={readOnly}
                                    placeholder="AC"
                                    className="flex-1 h-10 text-base"
                                />
                            </div>

                            <span className="text-sm font-bold text-slate-700 w-6">VP</span>
                            <div className="flex gap-2">
                                <CompactSelect
                                    value={data.visualAcuityVP_SC}
                                    onChange={(v) => handleChange("visualAcuityVP_SC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_NEAR}
                                    disabled={readOnly}
                                    placeholder="SC"
                                    className="flex-1 h-10 text-base"
                                />
                                <CompactSelect
                                    value={data.visualAcuityVP_AC}
                                    onChange={(v) => handleChange("visualAcuityVP_AC", v)}
                                    options={VISUAL_ACUITY_OPTIONS_NEAR}
                                    disabled={readOnly}
                                    placeholder="AC"
                                    className="flex-1 h-10 text-base"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Objective Refraction Row */}
                    <RefractionRow
                        label="Ref. Obj."
                        prefix="obj"
                        data={data}
                        onChange={handleChange}
                        readOnly={readOnly}
                    />

                    {/* Subjective Refraction Row */}
                    <RefractionRow
                        label="Ref. Subj."
                        prefix=""
                        data={data}
                        onChange={handleChange}
                        readOnly={readOnly}
                    />

                    <Separator />

                    {/* Keratometry Row */}
                    <div className="flex items-center gap-4">
                        <LabelBox label="Kérato" />
                        <div className="flex-1 grid grid-cols-4 gap-3">
                            <Field label="K1">
                                <CompactSelect
                                    value={data.k1 || ""}
                                    onChange={(v) => handleChange("k1", v)}
                                    options={KERATOMETRY_VALUES}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="K2">
                                <CompactSelect
                                    value={data.k2 || ""}
                                    onChange={(v) => handleChange("k2", v)}
                                    options={KERATOMETRY_VALUES}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="Rayon">
                                <Input
                                    value={data.rayon || ""}
                                    onChange={(e) => handleChange("rayon", e.target.value)}
                                    disabled={readOnly}
                                    placeholder="mm"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="Diamètre">
                                <Input
                                    value={data.diam || ""}
                                    onChange={(e) => handleChange("diam", e.target.value)}
                                    disabled={readOnly}
                                    placeholder="mm"
                                    className="h-10 text-sm"
                                />
                            </Field>
                        </div>
                    </div>

                    <Separator />

                    {/* Correction Row */}
                    <div className="flex items-center gap-4">
                        <LabelBox label="Correction" />
                        <div className="flex-1 grid grid-cols-4 gap-3">
                            <Field label="Verre">
                                <CompactSelect
                                    value={data.glassType}
                                    onChange={(v) => handleChange("glassType", v)}
                                    options={GLASS_TYPE_OPTIONS}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="Lentille">
                                <CompactSelect
                                    value={data.contactLensType}
                                    onChange={(v) => handleChange("contactLensType", v)}
                                    options={CONTACT_LENS_TYPE_OPTIONS}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="Modèle">
                                <CompactSelect
                                    value={data.lensType}
                                    onChange={(v) => handleChange("lensType", v)}
                                    options={LENS_TYPE_OPTIONS}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                            <Field label="Marque">
                                <CompactSelect
                                    value={data.lensBrand}
                                    onChange={(v) => handleChange("lensBrand", v)}
                                    options={LENS_BRAND_OPTIONS}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm"
                                />
                            </Field>
                        </div>
                    </div>

                    <Separator />

                    {/* Tonometry - Full width */}
                    <div className="flex items-center gap-4">
                        <LabelBox label="PIO" />
                        <div className="flex-1 grid grid-cols-5 gap-3">
                            <Field label="Tension">
                                <CompactSelect
                                    value={data.tension}
                                    onChange={(v) => handleChange("tension", v)}
                                    options={TENSION_VALUES}
                                    disabled={readOnly}
                                    placeholder="-"
                                    className="h-10 text-sm font-semibold"
                                />
                            </Field>
                            <Field label="Corr.">
                                <Input
                                    value={data.corrected_iop || ""}
                                    onChange={(e) => handleChange("corrected_iop", e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 text-sm px-2 font-semibold"
                                />
                            </Field>
                            <Field label="Applan.">
                                <Input
                                    value={data.tensionApplanation || ""}
                                    onChange={(e) => handleChange("tensionApplanation", e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 text-sm px-2"
                                />
                            </Field>
                            <Field label="Pachy">
                                <Input
                                    value={data.pachymetry || ""}
                                    onChange={(e) => handleChange("pachymetry", e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 text-sm px-2"
                                />
                            </Field>
                            <Field label="Heure">
                                <input
                                    type="time"
                                    value={data.tensionTime || ""}
                                    onChange={(e) => handleChange("tensionTime", e.target.value)}
                                    disabled={readOnly}
                                    className="h-10 w-full text-sm bg-white border border-input rounded-md px-2 focus:ring-1 focus:ring-ring"
                                />
                            </Field>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

// Reuse Components

function LabelBox({ label }: { label: string }) {
    return (
        <div className="w-[80px] flex-shrink-0 flex items-center justify-center h-full min-h-[40px]">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider text-center leading-tight">
                {label}
            </span>
        </div>
    );
}

function Field({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("space-y-1 w-full", className)}>
            {label && <Label className="text-[10px] text-slate-500 font-medium block truncate uppercase">{label}</Label>}
            {children}
        </div>
    );
}

// Row Component for Refraction
function RefractionRow({
    label,
    prefix,
    data,
    onChange,
    readOnly
}: {
    label: string;
    prefix: string;
    data: EyeData;
    onChange: (field: keyof EyeData, value: string) => void;
    readOnly?: boolean;
}) {
    const fields = [
        { label: "Sphère", key: prefix ? "objSph" : "sph", options: SPHERE_VALUES },
        { label: "Cylindre", key: prefix ? "objCyl" : "cyl", options: CYLINDER_VALUES },
        { label: "Axe", key: prefix ? "objAxis" : "axis", options: AXIS_VALUES },
        { label: "Add", key: prefix ? "objAdd" : "add", options: ADD_VALUES },
    ];

    return (
        <div className="flex items-center gap-4">
            <LabelBox label={label} />
            <div className="flex-1 grid grid-cols-4 gap-3">
                {fields.map((f) => (
                    <div key={f.key} className="space-y-1">
                        <Label className="text-[10px] font-semibold text-slate-500 uppercase">{f.label}</Label>
                        <CompactSelect
                            value={(data as any)[f.key] || ""}
                            onChange={(val: string) => onChange(f.key as any, val)}
                            options={f.options}
                            disabled={readOnly}
                            placeholder="-"
                            className="h-10 text-base font-medium"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string }) {
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
                    "flex w-full items-center justify-between rounded-md border border-slate-300 bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8 cursor-pointer hover:bg-slate-50 transition-colors",
                    className
                )}
                style={{ height: className?.match(/h-\d+/)?.[0] ? undefined : '2.5rem' }}
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
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    );
}
