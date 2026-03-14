import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Popover, PopoverContent, PopoverAnchor } from "@/ui/components/ui/popover";
import { EyeData, VISUAL_ACUITY_OPTIONS_DISTANCE_SC, VISUAL_ACUITY_OPTIONS_DISTANCE_AC, VISUAL_ACUITY_OPTIONS_NEAR, SPHERE_VALUES, CYLINDER_VALUES, AXIS_VALUES, ADD_VALUES, KERATOMETRY_VALUES, LENS_TYPE_OPTIONS, LENS_BRAND_OPTIONS, GLASS_TYPE_OPTIONS, CONTACT_LENS_TYPE_OPTIONS } from "./types";
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
                                <CompactSelect value={data.visualAcuityVL_SC ?? ''} onChange={(v) => handleChange("visualAcuityVL_SC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_SC} disabled={readOnly} placeholder="SC" />
                                <CompactSelect value={data.visualAcuityVL_AC ?? ''} onChange={(v) => handleChange("visualAcuityVL_AC", v)} options={VISUAL_ACUITY_OPTIONS_DISTANCE_AC} disabled={readOnly} placeholder="AC" />
                            </div>
                            <span className="font-bold text-slate-400 w-4 xl:w-5 2xl:w-6 text-right uppercase tracking-wider" style={{ fontSize: 'var(--dash-label)' }}>VP</span>
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.visualAcuityVP_SC ?? ''} onChange={(v) => handleChange("visualAcuityVP_SC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="SC" />
                                <CompactSelect value={data.visualAcuityVP_AC ?? ''} onChange={(v) => handleChange("visualAcuityVP_AC", v)} options={VISUAL_ACUITY_OPTIONS_NEAR} disabled={readOnly} placeholder="AC" />
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
                                <CompactSelect value={data.objSph ?? ''} onChange={(v) => handleChange("objSph", v)} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objCyl ?? ''} onChange={(v) => handleChange("objCyl", v)} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objAxis ?? ''} onChange={(v) => handleChange("objAxis", v)} options={AXIS_VALUES} disabled={readOnly} placeholder="-" />
                                <CompactSelect value={data.objAdd ?? ''} onChange={(v) => handleChange("objAdd", v)} options={ADD_VALUES} disabled={readOnly} placeholder="-" />
                            </div>
                        </RowLayout>
                    </div>

                    {/* Subjective - Highlighted */}
                    <div className={cn("rounded-md p-1 border shadow-sm relative z-10", themeBorder, isRight ? "bg-emerald-50/60" : "bg-blue-50/60")}>
                        <RowLayout label="SUB" title="Réfraction Subjective" className="items-center" headerClassName={cn("font-extrabold", themeColor)}>
                            <div className="grid grid-cols-4 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.sph ?? ''} onChange={(v) => handleChange("sph", v)} options={SPHERE_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.cyl ?? ''} onChange={(v) => handleChange("cyl", v)} options={CYLINDER_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.axis ?? ''} onChange={(v) => handleChange("axis", v)} options={AXIS_VALUES} disabled={readOnly} placeholder="-" bold />
                                <CompactSelect value={data.add ?? ''} onChange={(v) => handleChange("add", v)} options={ADD_VALUES} disabled={readOnly} placeholder="-" bold />
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
                                <CompactSelect value={data.k1 ?? ''} onChange={(v) => handleChange("k1", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K1" />
                                <CompactSelect value={data.k2 ?? ''} onChange={(v) => handleChange("k2", v)} options={KERATOMETRY_VALUES} disabled={readOnly} placeholder="K2" />
                            </div>
                        </div>
                    </RowLayout>

                    <Separator className={cn("my-1", themeBorder)} />

                    {/* Contact Lenses Section */}
                    <RowLayout label="LEN" title="Lentilles de Contact" headerClassName={themeColor}>
                        <div className="space-y-1.5">
                            {/* Type & Material */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.contactLensType ?? ''} onChange={(v) => handleChange("contactLensType", v)} options={CONTACT_LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Type" className="w-full" />
                                <CompactSelect value={data.lensType ?? ''} onChange={(v) => handleChange("lensType", v)} options={LENS_TYPE_OPTIONS} disabled={readOnly} placeholder="Matière" className="w-full" />
                            </div>

                            {/* Brand & Glass Type */}
                            <div className="grid grid-cols-2 gap-1.5 xl:gap-2">
                                <CompactSelect value={data.lensBrand ?? ''} onChange={(v) => handleChange("lensBrand", v)} options={LENS_BRAND_OPTIONS} disabled={readOnly} placeholder="Marque" className="w-full" />
                                <CompactSelect value={data.glassType ?? ''} onChange={(v) => handleChange("glassType", v)} options={GLASS_TYPE_OPTIONS} disabled={readOnly} placeholder="Verres" className="w-full" />
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

function CompactSelect({ value, onChange, options, disabled, placeholder, className, bold }: { value: string, onChange: (val: string) => void, options: { value: string, label: string }[], disabled?: boolean, placeholder?: string, className?: string, bold?: boolean }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Internal state for the input value - ensure we never use undefined (controlled input)
    const [inputValue, setInputValue] = useState(() => (value ?? '') === '' ? '' : (value ?? ''));

    // Sync state if external value changes (e.g. from store updates or "copy" actions)
    useEffect(() => {
        setInputValue((value ?? '') === '' ? '' : (value ?? ''));
    }, [value]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Callback ref that fires when the scroll container mounts inside the portal
    const scrollContainerCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        const hasVal = value && value !== '';
        const targetValue = hasVal ? value : '-0.75';

        const element = node.querySelector(`[data-value="${targetValue}"]`);
        if (element) {
            element.scrollIntoView({ block: 'start', behavior: 'auto' });
        } else if (!hasVal) {
            const zeroElement = node.querySelector(`[data-value="0.00"]`);
            if (zeroElement) zeroElement.scrollIntoView({ block: 'center' });
        }
    }, [value]);

    // Revert clearing on focus - only open dropdown
    const handleFocus = () => {
        if (!disabled) setOpen(true);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setInputValue('');
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setOpen(true);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            onChange(val === '' ? '' : val);
        }, 300);
    };

    const handleSelect = (optionValue: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onChange(optionValue);
        setInputValue(optionValue === '' ? '' : optionValue);
        setOpen(false);
        inputRef.current?.blur();
    };

    // Filter Logic
    const filteredOptions = useMemo(() => {
        if (!inputValue) return options;

        const cleanInput = inputValue.replace(/[+-]/g, '').trim();
        if (!cleanInput) return options;

        // Check if we should apply strict decimal logic (User: "not 20 if I type 2")
        const isDecimalField = options.some(o => o.value.includes('.') && !o.value.includes('/')); // Exclude "10/10"

        return options.filter(opt => {
            if (opt.value === '') return false;

            // Text matching for non-numeric fields
            if (!isDecimalField && !/^[+-]?\d/.test(opt.value)) {
                return opt.label.toLowerCase().includes(inputValue.toLowerCase());
            }

            // Numeric matching
            const optVal = opt.value;
            const cleanOpt = optVal.replace(/[+-]/g, '');

            // "Absolute value" starts with check
            if (cleanOpt.startsWith(cleanInput)) {
                // Strict check: if I typed "2", I don't want "20..."
                if (isDecimalField) {
                    // Check character after the match
                    const charAfter = cleanOpt[cleanInput.length];
                    // Valid if end of string or a decimal point
                    return charAfter === undefined || charAfter === '.';
                }
                return true;
            }
            return false;
        });
    }, [options, inputValue]);

    const hasValue = !!inputValue;

    return (

        <Popover open={open && !disabled}>
            <PopoverAnchor asChild>
                <div className={cn("relative w-full", className)} ref={containerRef}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={cn(
                            "flex w-full rounded-md border border-slate-200 bg-white/80 font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 pr-5 xl:pr-6 cursor-text hover:bg-white transition-all shadow-sm",
                            bold && "font-extrabold text-slate-900 border-slate-300 ring-1 ring-slate-100",
                            className
                        )}
                        style={{ height: 'var(--dash-h)', paddingInline: 'var(--dash-input-p)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        value={inputValue ?? ''}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        disabled={disabled}
                        placeholder={placeholder}
                    />
                    {hasValue && !disabled ? (
                        <X
                            className="absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors"
                            onClick={handleClear}
                        />
                    ) : (
                        <ChevronDown className="absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 pointer-events-none opacity-50" />
                    )}
                </div>
            </PopoverAnchor>

            <PopoverContent
                className="p-0 w-[--radix-popover-trigger-width] min-w-[80px]"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                    // Only close if clicking outside the container (input + wrapper)
                    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                        setOpen(false);
                    }
                }}
            >
                <div ref={scrollContainerCallbackRef} className="max-h-60 overflow-auto py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <div
                                key={`${option.value}-${option.label}`}
                                data-value={option.value}
                                className={cn(
                                    "px-2 cursor-pointer hover:bg-slate-100 font-medium text-slate-700",
                                    option.value === value && "bg-slate-50 text-slate-900 font-bold"
                                )}
                                style={{ paddingBlock: 'calc(var(--dash-p) / 2.5)', fontSize: 'var(--dash-label)' }}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))
                    ) : (
                        <div className="px-2 py-2 text-[10px] xl:text-xs text-slate-400 text-center italic">
                            Aucun résultat
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
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
