import { memo } from 'react';
import { Label } from "@/ui/components/ui/label";
import { OptimizedTextarea } from "@/ui/components/ui/optimized-input";
import { SmartAutocompleteInput } from "@/ui/components/shared/SmartAutocompleteInput";
import { SmartMultiSelectInput } from "@/ui/components/shared/SmartMultiSelectInput";
import { cn } from "@/ui/lib/utils";
import { useConsultationStore } from "@/ui/store/consultationStore";
import { Eye, Search, ScanEye, FileText, Stethoscope, Syringe } from "lucide-react";

import { DetailedClinicalExamData } from "@/ui/components/doctor/dashboard/types";

interface ClinicalExamTabProps {
    readOnly?: boolean;
    data?: DetailedClinicalExamData;
}

// New Card Component for sections - Defined outside to prevent re-renders
const ExamSection = ({ title, icon: Icon, children, className }: any) => (
    <div className={cn("bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden", className)}>
        <div className="bg-slate-50/50 px-3 py-1 border-b border-slate-100 flex items-center gap-2 min-h-[28px]">
            <Icon className="w-3.5 h-3.5 text-slate-500" />
            <h4 className="text-xs font-semibold text-slate-700">{title}</h4>
        </div>
        <div className="p-2">
            {children}
        </div>
    </div>
);

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
        <div className="h-full flex flex-col gap-2 pb-2">
            {/* 1. General Observations - Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[120px]">
                <ExamSection title="Inspection" icon={Search} className="flex flex-col">
                    <OptimizedTextarea
                        value={data.inspection || ""}
                        onChange={handleFieldChange("inspection")}
                        disabled={readOnly}
                        className="resize-none h-full min-h-[50px] border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 flex-1 leading-tight"
                    />
                </ExamSection>
                <ExamSection title="Motilité" icon={Eye} className="flex flex-col">
                    <OptimizedTextarea
                        value={data.motilityExam || ""}
                        onChange={handleFieldChange("motilityExam")}
                        disabled={readOnly}
                        className="resize-none h-full min-h-[50px] border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 flex-1 leading-tight"
                    />
                </ExamSection>
            </div>

            {/* 2. Detailed Eye Exam - Side by Side Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
                <ExamSection title="Segment Antérieur" icon={ScanEye} className="flex flex-col min-h-0 h-full">
                    <SmartMultiSelectInput
                        category="anterior_segment"
                        value={data.anteriorSegment?.slit_lamp_exam || ""}
                        onSelect={handleNestedChange("anteriorSegment", "slit_lamp_exam")}
                        placeholder="Examen segment antérieur..."
                        className="h-full border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 leading-tight whitespace-normal bg-transparent"
                    />
                </ExamSection>

                <ExamSection title="Fond d'œil" icon={ScanEye} className={cn("flex flex-col min-h-0 h-full", dilatationRequired ? "ring-2 ring-amber-400 ring-offset-2" : "")}>
                    <OptimizedTextarea
                        value={data.fundus?.fundus_exam || ""}
                        onChange={handleNestedChange("fundus", "fundus_exam")}
                        disabled={readOnly}
                        className="resize-none h-full border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 leading-tight"
                    />
                </ExamSection>
            </div>

            {/* 3. Conclusions - Compact */}
            <div className="grid grid-cols-2 gap-2 h-[80px]">
                <ExamSection title="Diagnostic" icon={Stethoscope} className="border-blue-200 flex flex-col">
                    <SmartMultiSelectInput
                        category="diagnostic"
                        value={data.diagnosis || ""}
                        onSelect={handleFieldChange("diagnosis")}
                        placeholder="Diagnostic..."
                        className="h-full border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 text-slate-800 font-medium leading-tight whitespace-normal"
                    />
                </ExamSection>
                <ExamSection title="Traitement" icon={Syringe} className="border-teal-200 flex flex-col">
                    <OptimizedTextarea
                        value={data.treatmentPlan || ""}
                        onChange={handleFieldChange("treatmentPlan")}
                        disabled={readOnly}
                        className="resize-none h-full border-0 focus-visible:ring-0 p-1 text-xs shadow-none -ml-1 leading-tight"
                    />
                </ExamSection>
            </div>
        </div>
    );
}

export default memo(ClinicalExamTab);
