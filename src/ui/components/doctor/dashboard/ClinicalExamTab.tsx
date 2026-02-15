import { memo } from 'react';
import { OptimizedTextarea } from "@/ui/components/ui/optimized-input";
import { SmartMultiSelectInput } from "@/ui/components/shared/SmartMultiSelectInput";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";

import { DetailedClinicalExamData } from "@/ui/components/doctor/dashboard/types";

interface ClinicalExamTabProps {
    readOnly?: boolean;
    data?: DetailedClinicalExamData;
}

function ClinicalExamTab({
    readOnly,
    data: externalData
}: ClinicalExamTabProps) {
    // Select state slices directly
    const storeData = useConsultationStore(state => state.clinicalExam);
    const data = externalData || storeData;
    const dilatationRequired = useConsultationStore(state => state.dilatationRequired);
    const updateClinicalExamField = useConsultationStore(state => state.updateClinicalExamField);

    const handleFieldChange = (field: string) => (value: string) => {
        if (readOnly) return;
        updateClinicalExamField(field, value);
    }

    const handleNestedChange = (parent: string, field: string) => (value: string) => {
        if (readOnly) return;
        updateClinicalExamField(`${parent}.${field}`, value);
    }

    return (
        <div className="h-full flex flex-col" style={{ gap: 'var(--dash-gap)' }}>
            {/* 1. Single-line observations - Compact height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-none" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="INSP" title="Inspection" colorAccent="slate" bgColor="bg-slate-50/90" compact>
                    <OptimizedTextarea
                        rows={1}
                        value={data.inspection || ""}
                        onChange={handleFieldChange("inspection")}
                        disabled={readOnly}
                        className="resize-none min-h-0 border border-slate-200 rounded-md focus-visible:ring-2 focus-visible:ring-slate-400 px-2 leading-tight placeholder:text-slate-300 w-full bg-white shadow-sm transition-all focus:border-slate-400"
                        style={{ height: 'var(--dash-h)', paddingBlock: 'calc(var(--dash-p) / 4)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        placeholder="Rien à signaler..."
                    />
                </RowLayout>
                <RowLayout label="MOT" title="Motilité" colorAccent="indigo" bgColor="bg-indigo-50/40" compact>
                    <OptimizedTextarea
                        rows={1}
                        value={data.motilityExam || ""}
                        onChange={handleFieldChange("motilityExam")}
                        disabled={readOnly}
                        className="resize-none min-h-0 border border-indigo-200/60 rounded-md focus-visible:ring-2 focus-visible:ring-indigo-400 px-2 leading-tight placeholder:text-indigo-300/50 w-full bg-white shadow-sm transition-all focus:border-indigo-400"
                        style={{ height: 'var(--dash-h)', paddingBlock: 'calc(var(--dash-p) / 4)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        placeholder="Normal..."
                    />
                </RowLayout>
            </div>

            {/* 2. Two-line detailed exam - Tall height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-none" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="SEG ANT" title="Segment Antérieur" colorAccent="blue" bgColor="bg-blue-50/80">
                    <div style={{ height: 'calc(var(--dash-h) * 2.5)' }}>
                        <SmartMultiSelectInput
                            category="anterior_segment"
                            value={data.anteriorSegment?.slit_lamp_exam || ""}
                            onSelect={handleNestedChange("anteriorSegment", "slit_lamp_exam")}
                            placeholder="Examen segment antérieur..."
                            className="border border-blue-200/60 rounded-md focus-visible:ring-2 focus-visible:ring-blue-400 text-xs xl:text-sm 2xl:text-base leading-normal whitespace-normal bg-white w-full h-full shadow-sm content-start items-start"
                        />
                    </div>
                </RowLayout>

                <RowLayout label="FO" title="Fond d'œil" colorAccent="purple" bgColor="bg-purple-50/80" className={cn(dilatationRequired && "ring-1 ring-amber-400 ring-offset-1 rounded-lg border-purple-200/60")}>
                    <OptimizedTextarea
                        value={data.fundus?.fundus_exam || ""}
                        onChange={handleNestedChange("fundus", "fundus_exam")}
                        disabled={readOnly}
                        className="resize-none border border-purple-200/60 rounded-md focus-visible:ring-2 focus-visible:ring-purple-400 text-xs xl:text-sm 2xl:text-base leading-normal placeholder:text-purple-300/50 w-full bg-white shadow-sm"
                        style={{ height: 'calc(var(--dash-h) * 2.5)', padding: 'calc(var(--dash-p) / 2)' }}
                        placeholder="Examen du fond d'œil..."
                    />
                </RowLayout>
            </div>

            {/* 3. Single-line conclusions - Compact height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-none" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="DIAG" title="Diagnostic" colorAccent="emerald" bgColor="bg-emerald-50/80" compact>
                    <div style={{ height: 'var(--dash-h)' }}>
                        <SmartMultiSelectInput
                            category="diagnostic"
                            value={data.diagnosis || ""}
                            onSelect={handleFieldChange("diagnosis")}
                            placeholder="Diagnostic..."
                            className="min-h-0 border border-emerald-200/60 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-400 px-2 font-bold text-slate-700 leading-tight whitespace-normal bg-white w-full h-full shadow-sm"
                        />
                    </div>
                </RowLayout>
                <RowLayout label="TRT" title="Traitement" colorAccent="teal" bgColor="bg-teal-50/80" compact>
                    <OptimizedTextarea
                        rows={1}
                        value={data.treatmentPlan || ""}
                        onChange={handleFieldChange("treatmentPlan")}
                        disabled={readOnly}
                        className="resize-none min-h-0 border border-teal-200/60 rounded-md focus-visible:ring-2 focus-visible:ring-teal-400 px-2 leading-tight placeholder:text-teal-300/50 w-full bg-white shadow-sm"
                        style={{ height: 'var(--dash-h)', paddingBlock: 'calc(var(--dash-p) / 4)', fontSize: 'calc(var(--dash-label) + 1px)' }}
                        placeholder="Traitement prescrit..."
                    />
                </RowLayout>
            </div>
        </div>
    );
}

// Helper Component
// Helper Component
function RowLayout({ label, title, colorAccent = "slate", bgColor, compact, children, className }: {
    label: string,
    title?: string,
    colorAccent?: "slate" | "indigo" | "purple" | "blue" | "teal" | "emerald",
    bgColor?: string,
    compact?: boolean,
    children: React.ReactNode,
    className?: string
}) {
    const colorMap = {
        slate: "text-slate-500 hover:text-slate-700",
        indigo: "text-indigo-500 hover:text-indigo-700",
        purple: "text-purple-500 hover:text-purple-700",
        blue: "text-blue-500 hover:text-blue-700",
        teal: "text-teal-500 hover:text-teal-700",
        emerald: "text-emerald-500 hover:text-emerald-700"
    };

    return (
        <div
            className={cn(
                "flex items-start rounded-lg border border-slate-200/50",
                bgColor,
                className
            )}
            style={{ gap: 'var(--dash-gap)', paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 1.5)' }}
        >
            <div className="w-12 xl:w-16 shrink-0 flex items-center justify-center pt-1.5 cursor-help" title={title}>
                <span
                    className={cn("font-bold uppercase tracking-tight transition-colors text-center leading-tight", colorMap[colorAccent])}
                    style={{ fontSize: 'var(--dash-label)' }}
                >{label}</span>
            </div>
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

export default memo(ClinicalExamTab);
