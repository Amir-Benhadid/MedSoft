import { memo } from 'react';
import { EyeData, VISUAL_ACUITY_OPTIONS_DISTANCE_SC, VISUAL_ACUITY_OPTIONS_DISTANCE_AC, VISUAL_ACUITY_OPTIONS_NEAR, SPHERE_VALUES, CYLINDER_VALUES, AXIS_VALUES, ADD_VALUES, KERATOMETRY_VALUES, LENS_TYPE_OPTIONS, LENS_BRAND_OPTIONS, GLASS_TYPE_OPTIONS, CONTACT_LENS_TYPE_OPTIONS } from "./types";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Input } from "@/ui/components/ui/input";
import { Card } from "@/ui/components/ui/card";
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
    const title = isRight ? "OD" : "OG";
    // Enhanced theme colors for better visual separation
    const themeColor = isRight ? "text-emerald-700" : "text-blue-700";
    const themeBg = isRight ? "bg-emerald-50/80" : "bg-blue-50/80";
    const themeBorder = isRight ? "border-emerald-100" : "border-blue-100";
    const themeRing = isRight ? "ring-emerald-100" : "ring-blue-100";
    const themeSectionBg = isRight ? "bg-emerald-50/60" : "bg-blue-50/60";

    const storeData = useConsultationStore(state => isRight ? state.rightEye : state.leftEye);
    const updateField = useConsultationStore(state => isRight ? state.updateRightEyeField : state.updateLeftEyeField);
    const data = externalData || storeData;

    const handleChange = (field: keyof EyeData, value: string) => {
        if (readOnly) return;
        updateField(field, value);
        // Auto-copy objective to subjective refraction
        if (field === 'objSph') updateField('sph', value);
        if (field === 'objCyl') updateField('cyl', value);
        if (field === 'objAxis') updateField('axis', value);
        if (field === 'objAdd') updateField('add', value);

        // Auto-fill R0 and DL for certain contact lens types
        if (field === 'contactLensType' && (value === 'Sphérique' || value === 'Torique')) {
            if (!data.axis_k) updateField('axis_k', '8.40');
            if (!data.diam) updateField('diam', '14.00');
        }
    };

    return (
        <Card className={cn("h-auto flex flex-col overflow-hidden shadow-sm border ring-1 transition-all", themeBg, themeBorder, themeRing)}>
            {/* Header */}
            <div className={cn("px-2 py-1.5 xl:px-3 xl:py-2.5 2xl:px-4 2xl:py-3 flex justify-between items-center border-b border-white/40 bg-white/30 backdrop-blur-[2px]")}>
                <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-xs xl:text-sm 2xl:text-base uppercase tracking-widest", themeColor)}>{title}</span>
                </div>
                {action && <div className="-my-1">{action}</div>}
            </div>

            <div className="flex-1 p-1.5 xl:p-2 2xl:p-3 space-y-2 xl:space-y-3 2xl:space-y-4">

                {/* Visual Acuity Card */}
                <div className={cn("bg-white/70 rounded-lg p-2 xl:p-2.5 border shadow-sm backdrop-blur-sm", themeBorder)}>
                    <RowLayout label="AV" title="Acuité Visuelle" headerClassName={themeColor}>
                        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 xl:gap-3 items-center">
                            <span className="text-[9px] xl:text-[10px] 2xl:text-xs font-bold text-slate-400 w-4 xl:w-5 2xl:w-6 uppercase tracking-wider">VL</span>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.visualAcuityVL_SC} onChange={(v) => handleChange("visualAcuityVL_SC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} disabled={readOnly} placeholder="SC" />
                                <CompactSelect value={data.visualAcuityVL_AC} onChange={(v) => handleChange("visualAcuityVL_AC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_AC} disabled={readOnly} placeholder="AC" />
                            </div>
                            <span className="text-[9px] xl:text-[10px] 2xl:text-xs font-bold text-slate-400 w-4 xl:w-5 2xl:w-6 text-right uppercase tracking-wider">VP</span>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.visualAcuityVP_SC} onChange={(v) => handleChange("visualAcuityVP_SC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="SC" />
                                <CompactSelect value={data.visualAcuityVP_AC} onChange={(v) => handleChange("visualAcuityVP_AC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="AC" />
                            </div>
                        </div>
                    </RowLayout>
                </div>

                {/* Refraction Card */}
                <div className={cn("bg-white/70 rounded-lg p-2 xl:p-2.5 border shadow-sm backdrop-blur-sm space-y-2", themeBorder)}>
                    {/* Table Header */}
                    <div className="flex items-center gap-1.5 xl:gap-2 px-1 mb-1">
                        <div className="w-6 xl:w-8 shrink-0"></div> {/* Spacer for Label column */}
                        <div className="flex-1 grid grid-cols-4 gap-1.5 xl:gap-2 text-center">
                            <HeaderLabel>Sphère</HeaderLabel>
                            <HeaderLabel>Cylindre</HeaderLabel>
                            <HeaderLabel>Axe</HeaderLabel>
                            <HeaderLabel>Add</HeaderLabel>
                        </div>
                    </div>

                    {/* Objective */}
                    <div className={cn("rounded-md p-1 border border-transparent hover:border-slate-100 transition-colors", themeSectionBg)}>
                        <RowLayout label="OBJ" title="Réfraction Objective" className="items-center" headerClassName={themeColor}>
                            <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.objSph} onChange={(v) => handleChange("objSph", v)} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objCyl} onChange={(v) => handleChange("objCyl", v)} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objAxis} onChange={(v) => handleChange("objAxis", v)} options={AXIS_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objAdd} onChange={(v) => handleChange("objAdd", v)} options={ADD_VALUES} disabled={readOnly} placeholder="-" />
                            </div>
                        </RowLayout>
                    </div>

                    {/* Subjective - Highlighted */}
                    <div className={cn("rounded-md p-1 border shadow-sm", themeBorder, isRight ? "bg-emerald-50/60" : "bg-blue-50/60")}>
                        <RowLayout label="SUB" title="Réfraction Subjective" className="items-center" headerClassName={cn("font-extrabold", themeColor)}>
                            <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.sph} onChange={(v) => handleChange("sph", v)} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.cyl} onChange={(v) => handleChange("cyl", v)} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.axis} onChange={(v) => handleChange("axis", v)} options={AXIS_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.add} onChange={(v) => handleChange("add", v)} options={ADD_VALUES} disabled={readOnly} placeholder="-" bold />
                            </div>
                        </RowLayout>
                    </div>
                </div>

                {/* Additional Info Card (Kerato & Lens) */}
                <div className={cn("bg-white/70 rounded-lg p-2 xl:p-2.5 border shadow-sm backdrop-blur-sm space-y-2", themeBorder)}>
                    {/* Keratometry */}
                    <RowLayout label="KER" title="Kératométrie" headerClassName={themeColor}>
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactInput value={data.axis_k || ""} onChange={(v) => handleChange("axis_k", v)} disabled={readOnly} placeholder="R0" />
                                <CompactInput value={data.diam || ""} onChange={(v) => handleChange("diam", v)} disabled={readOnly} placeholder="DL" />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.k1} onChange={(v) => handleChange("k1", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K1" />
                                <CompactSelect value={data.k2} onChange={(v) => handleChange("k2", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K2" />
                            </div>
                        </div>
                    </RowLayout>

                    <Separator className={cn("my-1", themeBorder)} />

                    {/* Contact Lenses Section */}
                    <RowLayout label="LEN" title="Lentilles de Contact" headerClassName={themeColor}>
                        <div className="space-y-1.5">
                            {/* Type & Material */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.contactLensType} onChange={(v) => handleChange("contactLensType", v)} options={CONTACT_LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Type" className="w-full" />
                                <CompactSelect value={data.lensType} onChange={(v) => handleChange("lensType", v)} options={LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Matière" className="w-full" />
                            </div>

                            {/* Brand & Glass Type */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.lensBrand} onChange={(v) => handleChange("lensBrand", v)} options={LENS_BRAND_OPTIONS} disabled={readOnly} placeholder="Marque" className="w-full" />
                                <CompactSelect value={data.glassType} onChange={(v) => handleChange("glassType", v)} options={GLASS_TYPE_OPTIONS} disabled={readOnly} placeholder="Verres" className="w-full" />
                            </div>
                        </div>
                    </RowLayout>
                </div>

            </div>
        </Card>
    );
});

// Helper Components

function RowLayout({ label, title, children, className, headerClassName }: { label: string, title?: string, children: React.ReactNode, className?: string, headerClassName?: string }) {
    return (
        <div className={cn("flex items-start gap-1.5 xl:gap-3", className)}>
            <div className="w-6 xl:w-8 shrink-0 flex items-center justify-center pt-1.5 xl:pt-2 cursor-help" title={title}>
                <span className={cn("text-[9px] xl:text-[11px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight hover:text-slate-700 transition-colors", headerClassName)}>{label}</span>
            </div>
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

function HeaderLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[9px] xl:text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">{children}</span>
    );
}

function CompactSelect({ value, onChange, options, disabled, placeholder, className, bold }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string, bold?: boolean }) {
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
                    "flex w-full items-center justify-between rounded-md border border-slate-200 bg-white/80 px-1.5 xl:px-2.5 py-1 xl:py-1.5 text-[10px] xl:text-xs 2xl:text-sm font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-5 xl:pr-6 cursor-pointer hover:bg-white transition-all h-6 xl:h-8 2xl:h-10 shadow-sm",
                    bold && "font-extrabold text-slate-900 border-slate-300 ring-1 ring-slate-100",
                    className
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
            <ChevronDown className="absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 pointer-events-none" />
        </div>
    );
}

function CompactInput({ value, onChange, placeholder, disabled, className }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean, className?: string }) {
    return (
        <div className={cn("relative w-full", className)}>
            <input
                type="text"
                className={cn(
                    "flex w-full rounded-md border border-slate-200 bg-white/80 px-1.5 xl:px-2.5 py-1 xl:py-1.5 text-[10px] xl:text-xs 2xl:text-sm font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 h-6 xl:h-8 2xl:h-10 shadow-sm transition-all hover:bg-white text-center",
                    className
                )}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
}
