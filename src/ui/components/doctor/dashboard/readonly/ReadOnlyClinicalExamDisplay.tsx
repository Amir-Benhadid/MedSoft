import { DetailedClinicalExamData } from "../types";

interface ReadOnlyClinicalExamDisplayProps {
    data?: DetailedClinicalExamData;
}

export function ReadOnlyClinicalExamDisplay({ data }: ReadOnlyClinicalExamDisplayProps) {
    if (!data) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                Aucune donnée clinique disponible
            </div>
        );
    }

    const sections = [
        { key: 'inspection', title: 'Inspection', content: data.inspection },
        { key: 'motility', title: 'Motilité', content: data.motilityExam },
        { key: 'anterior', title: 'Segment Antérieur', content: data.anteriorSegment?.slit_lamp_exam },
        { key: 'fundus', title: 'Fond d\'œil', content: data.fundus?.fundus_exam },
        { key: 'diagnosis', title: 'Diagnostic', content: data.diagnosis },
        { key: 'treatment', title: 'Traitement', content: data.treatmentPlan },
    ];

    const availableSections = sections.filter(s => s.content);

    if (availableSections.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                Aucune donnée clinique disponible
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {availableSections.map((section) => (
                <Section
                    key={section.key}
                    title={section.title}
                    content={section.content!}
                />
            ))}
        </div>
    );
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {title}
            </div>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 border border-slate-100 rounded p-3">
                {content}
            </div>
        </div>
    );
}
