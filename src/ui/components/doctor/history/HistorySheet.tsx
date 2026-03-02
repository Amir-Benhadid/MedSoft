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
import { Calendar } from "lucide-react";

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
            <SheetContent side="left" className="w-full sm:max-w-[580px] md:max-w-[640px] p-0 flex flex-col gap-0 border-r shadow-2xl">
                <SheetHeader className="px-3 py-2.5 border-b bg-white shrink-0">
                    <SheetTitle className="flex items-center gap-2 text-base text-slate-800">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Historique</span>
                    </SheetTitle>
                    <SheetDescription className="hidden">
                        Consultez l'historique des consultations et traitements.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 grid grid-rows-[6fr_4fr] min-h-0 gap-0 bg-slate-50/50">
                    {/* Top: Consultation List - Compact like PatientListView */}
                    <div className="min-h-0 relative border-b border-slate-200/60 transition-all">
                        <ScrollArea className="h-full">
                            <div className="p-3 flex flex-col gap-2">
                                {consultations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                                        <Calendar className="w-8 h-8 opacity-30" />
                                        <p className="text-sm font-medium">Aucun historique disponible</p>
                                    </div>
                                ) : (
                                    consultations.map((consultation) => {
                                        const isCurrent = consultation.id === currentConsultationId;
                                        const date = new Date(consultation.date);
                                        const isCompleted = consultation.status === 'completed';

                                        // Code colors: emerald for completed, amber for in progress, blue for selected
                                        const baseBg = isCurrent ? "bg-blue-500/15" : isCompleted ? "bg-emerald-500/10" : "bg-amber-500/10";
                                        const borderColor = isCurrent ? "border-blue-500" : isCompleted ? "border-emerald-300" : "border-amber-300";
                                        const hoverBorder = isCurrent ? "" : "hover:border-blue-400";
                                        const textColor = isCurrent ? "text-blue-900" : isCompleted ? "text-emerald-800" : "text-amber-800";
                                        const secondaryColor = isCurrent ? "text-blue-700/80" : isCompleted ? "text-emerald-600/80" : "text-amber-600/80";

                                        return (
                                            <div
                                                key={consultation.id}
                                                onClick={() => !isCurrent && onSelectConsultation(consultation)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2",
                                                    baseBg,
                                                    isCurrent ? "border-blue-500 shadow-md cursor-default" : cn(borderColor, hoverBorder, "hover:shadow-sm")
                                                )}
                                            >
                                                {/* Status color dot */}
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full shrink-0",
                                                    isCompleted ? "bg-emerald-500" : "bg-amber-500"
                                                )} />

                                                {/* Date */}
                                                <span className={cn("font-bold text-sm truncate flex-1 min-w-0 tabular-nums", textColor)}>
                                                    {format(date, "d MMM yyyy", { locale: fr })}
                                                </span>

                                                {/* Time */}
                                                <span className={cn("text-xs font-bold tabular-nums shrink-0", secondaryColor)}>
                                                    {format(date, "HH:mm")}
                                                </span>

                                                {/* Type */}
                                                <span className={cn("text-xs capitalize truncate shrink-0", secondaryColor)}>
                                                    {consultation.type}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Bottom: Treatments by date - date + inline medicine names */}
                    <div className="min-h-0 bg-white flex flex-col border-t border-slate-200 z-10">
                        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 bg-white">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <h3 className="font-bold text-[11px] text-slate-600 uppercase tracking-wider">Traitements</h3>
                        </div>
                        <ScrollArea className="flex-1 bg-slate-50/30">
                            <div className="p-2 flex flex-col gap-0.5">
                                {(() => {
                                    // Group treatments by date string (YYYY-MM-DD), most recent first
                                    const dateMap = new Map<string, string[]>();
                                    for (const c of consultations) {
                                        const treatments = c.prescription?.treatments || [];
                                        if (treatments.length === 0) continue;
                                        const dateKey = format(new Date(c.date), "yyyy-MM-dd");
                                        const existing = dateMap.get(dateKey) || [];
                                        const names = treatments.map(t => t.name);
                                        dateMap.set(dateKey, [...existing, ...names]);
                                    }
                                    const entries = Array.from(dateMap.entries())
                                        .sort((a, b) => b[0].localeCompare(a[0]));

                                    if (entries.length === 0) {
                                        return (
                                            <div className="flex items-center justify-center py-6 text-slate-400 text-[11px]">
                                                Aucun traitement prescrit
                                            </div>
                                        );
                                    }

                                    return entries.map(([dateKey, names]) => (
                                        <div
                                            key={dateKey}
                                            className="flex items-baseline gap-2 px-3 py-1.5 rounded text-[11px] hover:bg-emerald-500/5 transition-colors"
                                        >
                                            <span className="font-bold text-slate-600 tabular-nums shrink-0">
                                                {format(new Date(dateKey + "T12:00:00"), "d MMM yyyy", { locale: fr })}:
                                            </span>
                                            <span className="text-slate-700 truncate">{names.join(", ")}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
