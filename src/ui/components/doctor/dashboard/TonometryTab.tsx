import { memo, useState } from 'react';
import { EyeData, TENSION_VALUES, PACHYMETRY_VALUES } from "./types";
import { DashboardSelect } from '@/ui/components/ui/dashboard-select';
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
                    options={PACHYMETRY_VALUES}
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
            <DashboardSelect
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


export default memo(TonometryTab);
