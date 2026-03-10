import { memo, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { EyeData, TENSION_VALUES } from "./types";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Input } from "@/ui/components/ui/input";
import { ArrowRightLeft, Clock, ChevronDown, X } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Popover, PopoverContent, PopoverAnchor } from "@/ui/components/ui/popover";

export const iopValues = Array.from({ length: 46 }, (_, i) => ({
    value: String(i + 5),
    label: String(i + 5),
}));

export const pachymetryValues = Array.from({ length: 301 }, (_, i) => ({
    value: String(i + 400),
    label: String(i + 400),
}));

interface TonometryTabProps {
    readOnly?: boolean;
    data?: {
        leftEye?: EyeData;
        rightEye?: EyeData;
    };
}

function TonometryTab({ readOnly, data }: TonometryTabProps) {
    const leftEyeData = useConsultationStore(state => state.leftEye);
    const rightEyeData = useConsultationStore(state => state.rightEye);
    const updateLeftEyeField = useConsultationStore(state => state.updateLeftEyeField);
    const updateRightEyeField = useConsultationStore(state => state.updateRightEyeField);

    const leftData = data?.leftEye || leftEyeData;
    const rightData = data?.rightEye || rightEyeData;

    const [preferredSource, setPreferredSource] = useState<'air' | 'app'>('air');

    const recalculateAll = (source: 'air' | 'app') => {
        ['left', 'right'].forEach(side => {
            const data = side === 'left' ? leftData : rightData;
            const updateField = side === 'left' ? updateLeftEyeField : updateRightEyeField;

            const t_air = parseFloat(data.tension || '0');
            const t_app = parseFloat(data.tensionApplanation || '0');
            let t = 0;

            if (data.tension && data.tensionApplanation) {
                t = source === 'air' ? t_air : t_app;
            } else if (data.tension) {
                t = t_air;
            } else if (data.tensionApplanation) {
                t = t_app;
            }

            const p = parseFloat(data.pachymetry || '0');

            if (p > 0 && t > 0) {
                const corrected = t - ((p - 545) / 50 * 2.5);
                updateField('corrected_iop', corrected.toFixed(0));
            }
        });
    };

    const toggleSource = () => {
        const newSource = preferredSource === 'air' ? 'app' : 'air';
        setPreferredSource(newSource);
        recalculateAll(newSource);
    };

    const handleChange = (side: 'left' | 'right', field: keyof EyeData, value: string) => {
        if (readOnly) return;
        const updateField = side === 'left' ? updateLeftEyeField : updateRightEyeField;
        const currentData = side === 'left' ? leftData : rightData;

        // Auto-set time if empty and setting a value
        if (['tension', 'tensionApplanation', 'pachymetry', 'corrected_iop'].includes(field) && value && !currentData.tensionTime) {
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            updateField('tensionTime', timeString);
        }

        updateField(field, value);

        // Auto-calculate corrected IOP logic
        if (field === 'tension' || field === 'tensionApplanation' || field === 'pachymetry' || field === 'corrected_iop') {
            const getNewValue = (f: string) => f === field ? value : currentData[f as keyof EyeData] || '';
            const t_air_str = getNewValue('tension') as string;
            const t_app_str = getNewValue('tensionApplanation') as string;

            const p = parseFloat(getNewValue('pachymetry') as string || '0');
            const c = parseFloat(getNewValue('corrected_iop') as string || '0');

            let t = 0;
            if (t_air_str && t_app_str) {
                t = parseFloat(preferredSource === 'air' ? t_air_str : t_app_str);
            } else if (t_air_str) {
                t = parseFloat(t_air_str);
            } else if (t_app_str) {
                t = parseFloat(t_app_str);
            }

            if (p > 0) {
                if (field === 'tension' || field === 'tensionApplanation' || field === 'pachymetry') {
                    if (t > 0) {
                        const corrected = t - ((p - 545) / 50 * 2.5);
                        updateField('corrected_iop', corrected.toFixed(0));
                    }
                } else if (field === 'corrected_iop') {
                    const measured = c + ((p - 545) / 50 * 2.5);
                    if (preferredSource === 'air' || !t_app_str) {
                        updateField('tension', measured.toFixed(0));
                    } else {
                        updateField('tensionApplanation', measured.toFixed(0));
                    }
                }
            }
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-lg border-0 ring-1 ring-slate-200 shadow-sm overflow-hidden 2xl:shadow-md transition-all">
            {/* Header */}
            <div
                className="border-b border-slate-100 bg-slate-50/90 flex items-center justify-between"
                style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 3)' }}
            >
                <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'calc(var(--dash-label) * 1.2)' }}>Tonométrie</span>

                {!readOnly && (
                    <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                            "gap-1.5 px-2 h-6 xl:h-7 text-[10px] xl:text-xs transition-colors",
                            preferredSource === 'app' ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        )}
                        onClick={toggleSource}
                        title="Basculer la source de calcul pour PIO Corrigée"
                    >
                        <ArrowRightLeft className="w-3 h-3 xl:w-3.5 xl:h-3.5" />
                        {preferredSource === 'air' ? "Calcul via Air" : "Calcul via App"}
                    </Button>
                )}
            </div>

            {/* Content */}
            <div style={{ paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 1.5)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--dash-gap)' }}>
                    {/* Right Eye (OD) */}
                    <EyeStrip
                        colorClass="text-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-100/50 shadow-sm"
                        data={rightData}
                        onChange={(f, v) => handleChange('right', f, v)}
                        readOnly={readOnly}
                    />

                    {/* Left Eye (OG) */}
                    <EyeStrip
                        colorClass="text-blue-700 bg-blue-50/80 ring-1 ring-blue-100/50 shadow-sm"
                        data={leftData}
                        onChange={(f, v) => handleChange('left', f, v)}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}

function EyeStrip({ colorClass, data, onChange, readOnly }: {
    colorClass: string,
    data: EyeData,
    onChange: (f: keyof EyeData, v: string) => void,
    readOnly?: boolean
}) {
    return (
        <div
            className={cn("flex items-center rounded-lg border border-transparent hover:border-white/50 transition-all", colorClass)}
            style={{ gap: 'var(--dash-gap)', paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 2)' }}
        >
            <div className="flex items-center flex-1" style={{ gap: 'var(--dash-gap)' }}>
                {/* Tension (Air) */}
                <CompactSelectField
                    label="Air"
                    value={data.tension}
                    onChange={(v: string) => onChange("tension", v)}
                    options={iopValues}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Applanation */}
                <CompactSelectField
                    label="App"
                    value={data.tensionApplanation}
                    onChange={(v: string) => onChange("tensionApplanation", v)}
                    options={iopValues}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Corrected */}
                <CompactInput
                    label="Cor"
                    value={data.corrected_iop}
                    onChange={(v: string) => onChange("corrected_iop", v)}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                    bold
                />

                {/* Pachy */}
                <CompactSelectField
                    label="Pac"
                    value={data.pachymetry}
                    onChange={(v: string) => onChange("pachymetry", v)}
                    options={pachymetryValues}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Time */}
                <div className="flex flex-col items-center flex-none w-[60px] xl:w-[70px] 2xl:w-[80px]" style={{ gap: 'calc(var(--dash-gap) / 2)' }}>
                    <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'var(--dash-label)' }}>Heure</span>
                    <div className="relative w-full">
                        <input
                            type="time"
                            value={data.tensionTime || ""}
                            onChange={(e) => onChange("tensionTime", e.target.value)}
                            disabled={readOnly}
                            className="w-full font-bold text-slate-900 border border-slate-200 rounded-md px-1 pl-1 xl:pl-2 bg-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 shadow-sm transition-all text-left"
                            style={{ height: 'var(--dash-h)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompactInput({ label, value, onChange, width, placeholder, readOnly, bold }: any) {
    return (
        <div className={cn("flex flex-col items-center", width)} style={{ gap: 'calc(var(--dash-gap) / 2)' }}>
            <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'var(--dash-label)' }}>{label}</span>
            <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                className={cn(
                    "px-1 xl:px-1.5 font-bold text-slate-900 text-center bg-white border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all w-full",
                    bold && "font-extrabold text-slate-900 ring-1 ring-slate-100 bg-white"
                )}
                style={{ height: 'var(--dash-h)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                placeholder={placeholder}
            />
        </div>
    );
}

function CompactSelectField({ label, value, onChange, options, width, placeholder, readOnly, bold }: any) {
    return (
        <div className={cn("flex flex-col items-center", width)} style={{ gap: 'calc(var(--dash-gap) / 2)' }}>
            <span className="font-bold text-slate-500 uppercase tracking-tight" style={{ fontSize: 'var(--dash-label)' }}>{label}</span>
            <CompactSelect
                value={value}
                onChange={onChange}
                options={options}
                disabled={readOnly}
                placeholder={placeholder}
                bold={bold}
                className={cn(
                    "px-1 xl:px-1.5 text-center transition-all w-full",
                    bold && "font-extrabold text-slate-900 ring-1 ring-slate-100 bg-white"
                )}
            />
        </div>
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

export default memo(TonometryTab);
