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
            <SheetContent side="left" className="w-[750px] sm:w-[500px] sm:max-w-none p-0 flex flex-col gap-0 border-r">
                <SheetHeader className="p-6 border-b bg-muted/10">
                    <SheetTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Historique Médical
                    </SheetTitle>
                    <SheetDescription>
                        Consultez l'historique des consultations et traitements.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 grid grid-rows-[7fr_3fr] min-h-0 gap-0">
                    {/* Top: Consultation List */}
                    <div className="min-h-0 border-b relative">
                        <ScrollArea className="h-full">
                            <div className="p-6 flex flex-col gap-4">
                                {consultations.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10">
                                        Aucune consultation enregistrée.
                                    </div>
                                ) : (
                                    consultations.map((consultation) => {
                                        const isCurrent = consultation.id === currentConsultationId;
                                        const treatments = consultation.prescription?.treatments || [];

                                        return (
                                            <div
                                                key={consultation.id}
                                                onClick={() => !isCurrent && onSelectConsultation(consultation)}
                                                className={cn(
                                                    "flex flex-col rounded-lg border transition-all relative overflow-hidden bg-card",
                                                    isCurrent
                                                        ? "bg-primary/5 border-primary/20 ring-1 ring-primary/30 cursor-default"
                                                        : "hover:border-primary/20 hover:shadow-sm cursor-pointer"
                                                )}
                                            >
                                                {/* Header Section */}
                                                <div className="p-4 flex justify-between items-start gap-3">
                                                    {isCurrent && (
                                                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-bl-lg">
                                                            Sélectionnée
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-lg text-foreground/80 first-letter:capitalize">
                                                            {format(new Date(consultation.date), "EEEE dd MMMM yyyy", { locale: fr })}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground capitalize">
                                                            {consultation.type}
                                                        </span>
                                                    </div>
                                                    <Badge variant={consultation.status === 'completed' ? 'secondary' : 'outline'} className="mt-1">
                                                        {consultation.status === 'completed' ? 'Terminée' : 'En cours'}
                                                    </Badge>
                                                </div>

                                                {/* Treatments Section - Keep existing inline treatments too? User didn't ask to remove them, but duplicate info? 
                                                    The user asked for a section at the *bottom of the sheet*. 
                                                    I will keep the inline treatments as they provide context per consultation. 
                                                */}
                                                {treatments.length > 0 && (
                                                    <div className={cn(
                                                        "border-t bg-muted/20 px-4 py-3 text-sm",
                                                        isCurrent ? "bg-primary/5" : ""
                                                    )}>
                                                        <div className="flex items-center gap-2 mb-2 text-muted-foreground font-medium">
                                                            <Pill className="w-3.5 h-3.5" />
                                                            <span>Traitements Prescrits</span>
                                                        </div>
                                                        <div className="flex flex-col gap-2 pl-1">
                                                            {treatments.map((t, idx) => (
                                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-muted-foreground/80 bg-white/50 p-2 rounded border border-transparent hover:border-border/50 transition-colors">
                                                                    <span className="font-medium text-foreground">{t.name}</span>
                                                                    <div className="flex gap-3 text-xs opacity-80">
                                                                        {t.dosage && <span>{t.dosage}</span>}
                                                                        {t.frequency && <span>{formatValue(t.frequency)}</span>}
                                                                        {t.duration && <span>{formatValue(t.duration)}</span>}
                                                                    </div>
                                                                </div>
                                                            ))}
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
                    <div className="min-h-0 bg-slate-50/50 flex flex-col">
                        <div className="p-3 border-b bg-white/50 flex items-center gap-2 sticky top-0 z-10">
                            <Pill className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold text-sm text-slate-700">Historique des Traitements</h3>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-0">
                                {(() => {
                                    // Aggregate medications
                                    const medicationHistory = consultations
                                        .filter(c => c.prescription?.treatments && c.prescription.treatments.length > 0)
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(c => ({
                                            id: c.id,
                                            date: c.date,
                                            medications: c.prescription!.treatments.map(t => t.name).join(' - ')
                                        }));

                                    if (medicationHistory.length === 0) {
                                        return (
                                            <div className="text-center text-muted-foreground py-8 text-xs">
                                                Aucun traitement prescrit dans l'historique.
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="divide-y divide-slate-100">
                                            <div className="grid grid-cols-[100px_1fr] gap-2 px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-500">
                                                <span>Date</span>
                                                <span>Médicaments</span>
                                            </div>
                                            {medicationHistory.map((item) => (
                                                <div key={item.id} className="grid grid-cols-[100px_1fr] gap-2 px-4 py-2 text-sm hover:bg-emerald-50/10 transition-colors">
                                                    <span className="text-xs font-medium text-slate-500">
                                                        {format(new Date(item.date), 'dd MMM yyyy', { locale: fr })}
                                                    </span>
                                                    <span className="text-slate-700 font-medium">
                                                        {item.medications}
                                                    </span>
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
