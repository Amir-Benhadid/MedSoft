import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/ui/components/ui/sheet";
import { ScrollArea } from "@/ui/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/ui/lib/utils";
import { Calendar, Pill } from "lucide-react";
import { Badge } from "@/ui/components/ui/badge";

interface ConsultationHistoryItem {
    id: string;
    date: string;
    type: string;
    status: string;
    prescription?: {
        treatments: Array<{
            name: string;
            dosage: string;
            frequency: string | { value: number; unit: string };
            duration: string | { value: number; unit: string };
        }>;
    };
}

const formatValue = (val: string | { value: number; unit: string } | undefined) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    return `${val.value} ${val.unit}`;
};

interface HistorySheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    consultations: ConsultationHistoryItem[];
    currentConsultationId: string | null;
    onSelectConsultation: (consultation: ConsultationHistoryItem) => void;
}

export function HistorySheet({
    isOpen,
    onOpenChange,
    consultations,
    currentConsultationId,
    onSelectConsultation,
}: HistorySheetProps) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-0 flex flex-col gap-0 border-r shadow-2xl">
                <SheetHeader className="p-6 border-b bg-gradient-to-r from-slate-50 to-white">
                    <SheetTitle className="flex items-center gap-3 text-2xl text-slate-800">
                        <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span>Historique Médical</span>
                            <span className="text-sm font-normal text-slate-500 mt-1">Dossier complet du patient</span>
                        </div>
                    </SheetTitle>
                    <SheetDescription className="hidden">
                        Consultez l'historique des consultations et traitements.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 grid grid-rows-[6fr_4fr] min-h-0 gap-0 bg-slate-50/50">
                    {/* Top: Consultation List */}
                    <div className="min-h-0 relative border-b border-slate-200/60 transition-all">
                        <ScrollArea className="h-full">
                            <div className="p-6 space-y-4">
                                {consultations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                                        <div className="p-4 bg-slate-100 rounded-full">
                                            <Calendar className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">Aucun historique disponible</p>
                                    </div>
                                ) : (
                                    consultations.map((consultation) => {
                                        const isCurrent = consultation.id === currentConsultationId;
                                        const treatments = consultation.prescription?.treatments || [];
                                        const date = new Date(consultation.date);

                                        return (
                                            <div
                                                key={consultation.id}
                                                onClick={() => !isCurrent && onSelectConsultation(consultation)}
                                                className={cn(
                                                    "group flex flex-col rounded-xl border transition-all duration-200 relative overflow-hidden",
                                                    isCurrent
                                                        ? "bg-white border-blue-500 ring-1 ring-blue-500 shadow-md cursor-default"
                                                        : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                                                )}
                                            >
                                                {/* Status Indicator Bar */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
                                                    isCurrent ? "bg-blue-500" : "bg-transparent group-hover:bg-blue-300"
                                                )} />

                                                {/* Header Section */}
                                                <div className={cn("p-4 pl-5 flex justify-between items-start gap-4", isCurrent && "pr-28")}>
                                                    {isCurrent && (
                                                        <div className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-bl-xl shadow-sm">
                                                            Sélectionnée
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-lg text-slate-800 capitalize flex items-center gap-2">
                                                            {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                            <span className="capitalize">{consultation.type}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{format(date, "HH:mm")}</span>
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "mt-1 px-2.5 py-0.5 border text-xs font-semibold capitalize",
                                                            consultation.status === 'completed'
                                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                                        )}
                                                    >
                                                        {consultation.status === 'completed' ? 'Terminée' : 'En cours'}
                                                    </Badge>
                                                </div>

                                                {/* Treatments Preview - Compact */}
                                                {treatments.length > 0 && (
                                                    <div className="mx-4 mb-4 mt-0 pt-3 border-t border-slate-100">
                                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                            <Pill className="w-3.5 h-3.5" />
                                                            <span>Traitements</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {treatments.slice(0, 3).map((t, idx) => (
                                                                <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 font-medium">
                                                                    {t.name}
                                                                </Badge>
                                                            ))}
                                                            {treatments.length > 3 && (
                                                                <Badge variant="outline" className="text-slate-400 border-dashed border-slate-300">
                                                                    +{treatments.length - 3} autres
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Bottom: Aggregated Medication History */}
                    <div className="min-h-0 bg-white flex flex-col border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600">
                                    <Pill className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Historique Global des Traitements</h3>
                            </div>
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                Chronologique
                            </span>
                        </div>
                        <ScrollArea className="flex-1 bg-slate-50/30">
                            <div className="divide-y divide-slate-100">
                                {(() => {
                                    const medicationHistory = consultations
                                        .filter(c => c.prescription?.treatments && c.prescription.treatments.length > 0)
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .flatMap(c => (c.prescription?.treatments || []).map(t => ({
                                            ...t,
                                            date: c.date,
                                            consultationId: c.id
                                        })));

                                    if (medicationHistory.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs gap-2">
                                                <Pill className="w-8 h-8 opacity-20" />
                                                <span>Aucun traitement prescrit</span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="grid grid-cols-1">
                                            {medicationHistory.map((item, idx) => (
                                                <div key={`${item.consultationId}-${idx}`} className="group flex items-center gap-4 px-6 py-3 hover:bg-white hover:shadow-sm transition-all border-l-4 border-transparent hover:border-emerald-400">
                                                    <div className="flex flex-col items-end min-w-[60px] shrink-0 text-right">
                                                        <span className="text-sm font-black text-slate-700">
                                                            {format(new Date(item.date), 'dd', { locale: fr })}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                            {format(new Date(item.date), 'MMM yyyy', { locale: fr })}
                                                        </span>
                                                    </div>

                                                    <div className="h-8 w-px bg-slate-200 group-hover:bg-slate-300 transition-colors" />

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-slate-800 truncate">{item.name}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
