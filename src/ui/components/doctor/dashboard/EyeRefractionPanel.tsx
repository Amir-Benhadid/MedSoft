import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from "@/ui/components/ui/popover";
import { EyeData, VISUAL_ACUITY_OPTIONS_DISTANCE_SC, VISUAL_ACUITY_OPTIONS_DISTANCE_AC, VISUAL_ACUITY_OPTIONS_NEAR, SPHERE_VALUES, CYLINDER_VALUES, AXIS_VALUES, ADD_VALUES, KERATOMETRY_VALUES, LENS_TYPE_OPTIONS, LENS_BRAND_OPTIONS, GLASS_TYPE_OPTIONS, CONTACT_LENS_TYPE_OPTIONS } from "./types";
import { DashboardSelect } from '@/ui/components/ui/dashboard-select';
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Input } from "@/ui/components/ui/input";
import { Card } from "@/ui/components/ui/card";
import { Separator } from "@/ui/components/ui/separator";
import { ChevronDown, X } from "lucide-react";

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
    const setObjectiveRefraction = useConsultationStore(state => state.setObjectiveRefraction);
    const setGlassType = useConsultationStore(state => state.setGlassType);
    const data = externalData || storeData;

    const handleChange = (field: keyof EyeData, value: string) => {
        if (readOnly) return;
        updateField(field, value);

        // Auto-fill R0 and DL for certain contact lens types
        if (field === 'contactLensType' && (value === 'Sphérique' || value === 'Torique')) {
            if (!data.axis_k) updateField('axis_k', '8.40');
            if (!data.diam) updateField('diam', '14.00');
        }
    };

    return (
        <Card className={cn("h-full flex flex-col shadow-sm border ring-1 transition-all overflow-hidden", themeBg, themeBorder, themeRing)}>
            {/* Header */}
            <div
                className={cn("rounded-t-lg flex justify-between items-center border-b border-white/40 bg-white/30 backdrop-blur-[2px]")}
                style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 3)' }}
            >
                <div className="flex items-center gap-2">
                    <span className={cn("font-bold uppercase tracking-widest", themeColor)} style={{ fontSize: 'var(--dash-label)' }}>{title}</span>
                </div>
                {action && <div className="-my-1">{action}</div>}
            </div>

            <div className="flex flex-col min-h-0" style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'var(--dash-gap)', gap: 'var(--dash-gap)' }}>

                {/* Visual Acuity Card */}
                <div
                    className={cn("bg-white/70 rounded-lg border shadow-sm backdrop-blur-sm relative z-30", themeBorder)}
                    style={{ padding: 'calc(var(--dash-p) / 1.5)' }}
                >
                    <RowLayout label="AV" title="Acuité Visuelle" headerClassName={themeColor}>
                        <div className="grid grid-cols-[auto_1fr_auto_1fr] gap-2 xl:gap-3 items-center">
                            <span className="font-bold text-slate-400 w-4 xl:w-5 2xl:w-6 uppercase tracking-wider" style={{ fontSize: 'var(--dash-label)' }}>VL</span>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.visualAcuityVL_SC ?? ''} onChange={(v) => handleChange("visualAcuityVL_SC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} disabled={readOnly} placeholder="SC" />
                                <DashboardSelect value={data.visualAcuityVL_AC ?? ''} onChange={(v) => handleChange("visualAcuityVL_AC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_AC} disabled={readOnly} placeholder="AC" />
                            </div>
                            <span className="font-bold text-slate-400 w-4 xl:w-5 2xl:w-6 text-right uppercase tracking-wider" style={{ fontSize: 'var(--dash-label)' }}>VP</span>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.visualAcuityVP_SC ?? ''} onChange={(v) => handleChange("visualAcuityVP_SC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="SC" />
                                <DashboardSelect value={data.visualAcuityVP_AC ?? ''} onChange={(v) => handleChange("visualAcuityVP_AC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="AC" />
                            </div>
                        </div>
                    </RowLayout>
                </div>

                {/* Refraction Card */}
                <div
                    className={cn("bg-white/70 rounded-lg border shadow-sm backdrop-blur-sm relative z-20", themeBorder)}
                    style={{ padding: 'calc(var(--dash-p) / 1.5)', display: 'flex', flexDirection: 'column', gap: 'calc(var(--dash-gap) / 2)' }}
                >
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
                    <div className={cn("rounded-md p-1 border border-transparent hover:border-slate-100 transition-colors relative z-20", themeSectionBg)}>
                        <RowLayout label="OBJ" title="Réfraction Objective" className="items-center" headerClassName={themeColor}>
                            <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.objSph ?? ''} onChange={(v) => setObjectiveRefraction(side, { sph: v })} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" />
                                <DashboardSelect value={data.objCyl ?? ''} onChange={(v) => setObjectiveRefraction(side, { cyl: v })} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" />
                                <DashboardSelect value={data.objAxis ?? ''} onChange={(v) => setObjectiveRefraction(side, { axis: v })} options={AXIS_VALUES} disabled={readOnly} placeholder="-" />
                                <DashboardSelect value={data.objAdd ?? ''} onChange={(v) => setObjectiveRefraction(side, { add: v })} options={ADD_VALUES} disabled={readOnly} placeholder="-" />
                            </div>
                        </RowLayout>
                    </div>

                    {/* Subjective - Highlighted */}
                    <div className={cn("rounded-md p-1 border shadow-sm relative z-10", themeBorder, isRight ? "bg-emerald-50/60" : "bg-blue-50/60")}>
                        <RowLayout label="SUB" title="Réfraction Subjective" className="items-center" headerClassName={cn("font-extrabold", themeColor)}>
                            <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.sph ?? ''} onChange={(v) => handleChange("sph", v)} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" bold />
                                <DashboardSelect value={data.cyl ?? ''} onChange={(v) => handleChange("cyl", v)} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" bold />
                                <DashboardSelect value={data.axis ?? ''} onChange={(v) => handleChange("axis", v)} options={AXIS_VALUES} disabled={readOnly} placeholder="-" bold />
                                <DashboardSelect value={data.add ?? ''} onChange={(v) => handleChange("add", v)} options={ADD_VALUES} disabled={readOnly} placeholder="-" bold />
                            </div>
                        </RowLayout>
                    </div>
                </div>

                {/* Additional Info Card (Kerato & Lens) */}
                <div
                    className={cn("bg-white/70 rounded-lg border shadow-sm backdrop-blur-sm relative z-10", themeBorder)}
                    style={{ padding: 'calc(var(--dash-p) / 1.5)', display: 'flex', flexDirection: 'column', gap: 'calc(var(--dash-gap) / 2)' }}
                >
                    {/* Keratometry */}
                    <RowLayout label="KER" title="Kératométrie" headerClassName={themeColor}>
                        <div className="space-y-1.5">
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactInput value={data.axis_k || ""} onChange={(v) => handleChange("axis_k", v)} disabled={readOnly} placeholder="R0" />
                                <CompactInput value={data.diam || ""} onChange={(v) => handleChange("diam", v)} disabled={readOnly} placeholder="DL" />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.k1 ?? ''} onChange={(v) => handleChange("k1", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K1" />
                                <DashboardSelect value={data.k2 ?? ''} onChange={(v) => handleChange("k2", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K2" />
                            </div>
                        </div>
                    </RowLayout>

                    <Separator className={cn("my-1", themeBorder)} />

                    {/* Contact Lenses Section */}
                    <RowLayout label="LEN" title="Lentilles de Contact" headerClassName={themeColor}>
                        <div className="space-y-1.5">
                            {/* Type & Material */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.contactLensType ?? ''} onChange={(v) => handleChange("contactLensType", v)} options={CONTACT_LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Type" className="w-full" />
                                <DashboardSelect value={data.lensType ?? ''} onChange={(v) => handleChange("lensType", v)} options={LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Matière" className="w-full" />
                            </div>
 
                            {/* Brand & Glass Type */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <DashboardSelect value={data.lensBrand ?? ''} onChange={(v) => handleChange("lensBrand", v)} options={LENS_BRAND_OPTIONS} disabled={readOnly} placeholder="Marque" className="w-full" />
                                <DashboardSelect value={data.glassType ?? ''} onChange={(v) => setGlassType(v)} options={GLASS_TYPE_OPTIONS} disabled={readOnly} placeholder="Verres" className="w-full" />
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
        <div className={cn("flex items-start", className)} style={{ gap: 'var(--dash-gap)' }}>
            <div className="w-6 xl:w-8 shrink-0 flex items-center justify-center pt-1 cursor-help" title={title}>
                <span className={cn("font-bold text-slate-500 uppercase tracking-tight hover:text-slate-700 transition-colors", headerClassName)} style={{ fontSize: 'var(--dash-label)' }}>{label}</span>
            </div>
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

function HeaderLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'var(--dash-label)' }}>{children}</span>
    );
}


function CompactInput({ value, onChange, placeholder, disabled, className }: { value: string, onChange: (val: string) => void, placeholder?: string, disabled?: boolean, className?: string }) {
    return (
        <div className={cn("relative w-full", className)}>
            <input
                type="text"
                className={cn(
                    "flex w-full rounded-md border border-slate-200 bg-white/80 font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all hover:bg-white text-center",
                    className
                )}
                style={{ height: 'var(--dash-h)', paddingInline: 'var(--dash-input-p)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
}
