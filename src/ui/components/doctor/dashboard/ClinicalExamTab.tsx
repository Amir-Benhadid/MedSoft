import { memo } from 'react';
import { OptimizedTextarea, OptimizedInput } from "@/ui/components/ui/optimized-input";
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
        <div className="h-full flex flex-col min-h-0" style={{ gap: 'var(--dash-gap)' }}>
            {/* 1. Row 1 - 1 vertical space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="INSP" title="Inspection" colorAccent="slate" bgColor="bg-slate-50/90" compact>
                    <OptimizedInput
                        value={data.inspection || ""}
                        onChange={handleFieldChange("inspection")}
                        disabled={readOnly}
                        className="min-h-0 border border-slate-200 rounded-md focus-visible:ring-2 focus-visible:ring-slate-400 px-2 leading-tight placeholder:text-slate-300 w-full h-full bg-white shadow-sm transition-all focus:border-slate-400 text-sm xl:text-base font-normal"
                        placeholder="Rien à signaler..."
                    />
                </RowLayout>
                <RowLayout label="MOT" title="Motilité" colorAccent="indigo" bgColor="bg-indigo-50/40" compact>
                    <OptimizedInput
                        value={data.motilityExam || ""}
                        onChange={handleFieldChange("motilityExam")}
                        disabled={readOnly}
                        className="min-h-0 border border-slate-200 rounded-md focus-visible:ring-2 focus-visible:ring-slate-400 px-2 leading-tight placeholder:text-slate-300 w-full h-full bg-white shadow-sm transition-all focus:border-slate-400 text-sm xl:text-base font-normal"
                        placeholder="Normal..."
                    />
                </RowLayout>
            </div>

            {/* 2. Row 2 - 2 vertical spaces */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-[2] min-h-0" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="SEG ANT" title="Segment Antérieur" colorAccent="blue" bgColor="bg-blue-50/80">
                    <div className="h-full min-h-0 overflow-hidden">
                        <SmartMultiSelectInput
                            category="anterior_segment"
                            value={data.anteriorSegment?.slit_lamp_exam || ""}
                            onSelect={handleNestedChange("anteriorSegment", "slit_lamp_exam")}
                            placeholder="Examen segment antérieur..."
                            className="h-full border-slate-200 focus-within:ring-slate-400 focus-within:border-slate-400"
                        />
                    </div>
                </RowLayout>

                <RowLayout label="FO" title="Fond d'œil" colorAccent="purple" bgColor="bg-purple-50/80" className={cn(dilatationRequired && "ring-1 ring-amber-400 ring-offset-1 rounded-lg border-purple-200/60")}>
                    <OptimizedTextarea
                        value={data.fundus?.fundus_exam || ""}
                        onChange={handleNestedChange("fundus", "fundus_exam")}
                        disabled={readOnly}
                        className="resize-none h-full min-h-0 border border-slate-200 rounded-md focus-visible:ring-2 focus-visible:ring-slate-400 text-sm xl:text-base font-normal leading-normal placeholder:text-slate-300 w-full bg-white shadow-sm p-2"
                        placeholder="Examen du fond d'œil..."
                    />
                </RowLayout>
            </div>

            {/* 3. Row 3 - 1 vertical space */}
            <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0" style={{ gap: 'var(--dash-gap)' }}>
                <RowLayout label="DIAG" title="Diagnostic" colorAccent="emerald" bgColor="bg-emerald-50/80" compact>
                    <div className="h-full min-h-0 overflow-hidden">
                        <SmartMultiSelectInput
                            category="diagnostic"
                            value={data.diagnosis || ""}
                            onSelect={handleFieldChange("diagnosis")}
                            placeholder="Diagnostic..."
                            className="h-full border-slate-200 focus-within:ring-slate-400 focus-within:border-slate-400"
                        />
                    </div>
                </RowLayout>
                <RowLayout label="CDT" title="Traitement" colorAccent="teal" bgColor="bg-teal-50/80" compact>
                    <OptimizedTextarea
                        value={data.treatmentPlan || ""}
                        onChange={handleFieldChange("treatmentPlan")}
                        disabled={readOnly}
                        className="resize-none h-full min-h-0 border border-slate-200 rounded-md focus-visible:ring-2 focus-visible:ring-slate-400 px-2 leading-tight placeholder:text-slate-300 w-full bg-white shadow-sm text-sm xl:text-base font-normal p-2"
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
                "flex rounded-lg border border-slate-200/50 min-h-0 overflow-hidden",
                "items-stretch",
                bgColor,
                className
            )}
            style={{ gap: 'var(--dash-gap)', paddingInline: 'var(--dash-p)', paddingBlock: 'calc(var(--dash-gap) / 1.5)' }}
        >
            <div className={cn("w-12 xl:w-16 shrink-0 flex items-center justify-center cursor-help", !compact && "pt-1.5")} title={title}>
                <span
                    className={cn("font-bold uppercase tracking-tight transition-colors text-center leading-tight", colorMap[colorAccent])}
                    style={{ fontSize: 'var(--dash-label)' }}
                >{label}</span>
            </div>
            <div className="flex-1 min-w-0 min-h-0">
                {children}
            </div>
        </div>
    );
}

export default memo(ClinicalExamTab);
