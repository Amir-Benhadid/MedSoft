import { memo } from 'react';
import { EyeData, TENSION_VALUES } from "./types";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Input } from "@/ui/components/ui/input";
import { Clock } from "lucide-react";

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

        // Auto-calculate corrected IOP logic remains same...
        if (field === 'tension' || field === 'pachymetry' || field === 'corrected_iop') {
            const t = parseFloat(field === 'tension' ? value : currentData.tension || '0');
            const p = parseFloat(field === 'pachymetry' ? value : currentData.pachymetry || '0');
            const c = parseFloat(field === 'corrected_iop' ? value : currentData.corrected_iop || '0');

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
        <div className="flex flex-col bg-white rounded-lg border-0 ring-1 ring-slate-200 shadow-sm overflow-hidden 2xl:shadow-md transition-all">
            {/* Header */}
            <div className="px-2 py-1 xl:px-3 xl:py-1.5 2xl:py-2.5 border-b border-slate-100 bg-slate-50/90 flex items-center">
                <span className="text-[10px] xl:text-[11px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">Tonométrie</span>
            </div>

            {/* Content */}
            <div className="p-1.5 xl:p-2 2xl:p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 xl:gap-2 2xl:gap-4">
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
        <div className={cn("flex items-center gap-1.5 xl:gap-2 p-1.5 xl:p-2 2xl:p-3 rounded-lg border border-transparent hover:border-white/50 transition-all", colorClass)}>
            <div className="flex items-center gap-1.5 xl:gap-2 flex-1">
                {/* Tension (Air) */}
                <CompactInput
                    label="Air"
                    value={data.tension}
                    onChange={(v) => onChange("tension", v)}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Applanation */}
                <CompactInput
                    label="App"
                    value={data.tensionApplanation}
                    onChange={(v) => onChange("tensionApplanation", v)}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Corrected */}
                <CompactInput
                    label="Cor"
                    value={data.corrected_iop}
                    onChange={(v) => onChange("corrected_iop", v)}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                    bold
                />

                {/* Pachy */}
                <CompactInput
                    label="Pac"
                    value={data.pachymetry}
                    onChange={(v) => onChange("pachymetry", v)}
                    width="flex-1"
                    placeholder="-"
                    readOnly={readOnly}
                />

                {/* Time */}
                <div className="flex flex-col items-center gap-0.5 flex-none w-[60px] xl:w-[70px] 2xl:w-[80px]">
                    <span className="text-[9px] xl:text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">Heure</span>
                    <div className="relative w-full">
                        <input
                            type="time"
                            value={data.tensionTime || ""}
                            onChange={(e) => onChange("tensionTime", e.target.value)}
                            disabled={readOnly}
                            className="h-6 xl:h-8 2xl:h-10 w-full text-[10px] xl:text-xs 2xl:text-sm font-bold text-slate-900 border border-slate-200 rounded-md px-1 pl-1 xl:pl-2 bg-white focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 shadow-sm transition-all text-left"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompactInput({ label, value, onChange, width, placeholder, readOnly, bold }: any) {
    return (
        <div className={cn("flex flex-col items-center gap-0.5", width)}>
            <span className="text-[9px] xl:text-[10px] 2xl:text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</span>
            <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                disabled={readOnly}
                className={cn(
                    "h-6 xl:h-8 2xl:h-10 px-1 xl:px-1.5 text-[10px] xl:text-xs 2xl:text-sm font-bold text-slate-900 text-center bg-white border-slate-200 rounded-md shadow-sm focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 transition-all w-full",
                    bold && "font-extrabold text-slate-900 ring-1 ring-slate-100 bg-white"
                )}
                placeholder={placeholder}
            />
        </div>
    );
}
export default memo(TonometryTab);
