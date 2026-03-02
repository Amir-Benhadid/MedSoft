import { ScrollArea } from '@/ui/components/ui/scroll-area';
import { cn } from '@/ui/lib/utils';

import { Badge } from '@/ui/components/ui/badge';
import { Button } from '@/ui/components/ui/button';
import { Clock, ChevronRight, TrendingUp, MapPin, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { UnifiedPatientItem } from './types';
import { getStatusColor, getStatusLabel, getAge } from './utils';

interface PatientListViewProps {
    list: UnifiedPatientItem[];
    selectedId: string | null | undefined;
    onSelect: (item: UnifiedPatientItem) => void;
    isLoading: boolean;
}

export default function PatientListView({ list, selectedId, onSelect, isLoading }: PatientListViewProps) {
    const inConsultationItems = list.filter(i => i.status === 'in_consultation');
    const otherItems = list.filter(i => i.status !== 'in_consultation');

    return (
        <ScrollArea className="flex-1 px-3">
            <div className="flex flex-col pb-4">
                <div className="flex flex-col gap-2">
                    {/* IN CONSULTATION SECTION */}
                    {inConsultationItems.map(item => (
                        <div
                            key={`consulting-${item.patientId}`}
                            onClick={() => onSelect(item)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2",
                                selectedId === item.patientId
                                    ? "bg-emerald-500/15 border-emerald-500 shadow-md"
                                    : "bg-emerald-500/10 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-500/20 hover:shadow-sm"
                            )}
                        >
                            {/* Patient name with status indicator */}
                            <span className={cn(
                                "font-bold text-sm truncate w-[30%] min-w-0 flex items-center gap-2",
                                selectedId === item.patientId ? "text-emerald-800" : "text-emerald-700"
                            )}>
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                {item.patient?.name} {item.patient?.surname}
                            </span>

                            {/* Appointment Time */}
                            <span className="text-xs font-bold text-emerald-700 tabular-nums w-[10%] min-w-[50px]">
                                {format(item.time, 'HH:mm')}
                            </span>

                            {/* Arrival Hour - only show if different from appointment time */}
                            {item.arrivalTime && format(item.arrivalTime, 'HH:mm') !== format(item.time, 'HH:mm') ? (
                                <span className="text-xs text-emerald-600/80 tabular-nums w-[10%] min-w-[50px]">
                                    {format(item.arrivalTime, 'HH:mm')}
                                </span>
                            ) : (
                                <span className="w-[10%] min-w-[50px]" />
                            )}

                            {/* Age */}
                            {item.patient?.dob && (
                                <span className="text-xs text-emerald-600/80 w-[10%] min-w-[40px]">
                                    {getAge(item.patient.dob)}
                                </span>
                            )}

                            {/* Phone */}
                            {item.patient?.phone && (
                                <span className="text-xs text-emerald-600/80 w-[15%] min-w-[80px]">
                                    {item.patient.phone}
                                </span>
                            )}

                            {/* City */}
                            {item.patient?.address?.city && (
                                <span className="text-xs text-emerald-600/80 w-[15%] min-w-[60px] truncate">
                                    {item.patient.address.city}
                                </span>
                            )}

                            {/* Dilation badge */}
                            {item.needsDilation && (
                                <Badge className="h-5 px-2.5 text-[10px] bg-emerald-600/25 text-emerald-800 border-0 shrink-0 font-semibold">
                                    Dil.
                                </Badge>
                            )}

                            {/* Notes */}
                            {item.notes && (
                                <span className="text-[11px] text-emerald-600/70 italic truncate max-w-[150px] shrink-0">
                                    {item.notes}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Separator with label */}
                    {inConsultationItems.length > 0 && otherItems.length > 0 && (
                        <div className="relative my-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t-2 border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#f8fafc] px-4 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    En Attente
                                </span>
                            </div>
                        </div>
                    )}

                    {/* OTHER ITEMS */}
                    {isLoading ? (
                        <div className="p-8 flex flex-col items-center text-slate-400 gap-3">
                            <div className="h-6 w-6 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                            <span className="text-xs">Chargement...</span>
                        </div>
                    ) : otherItems.length === 0 && inConsultationItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-slate-300 text-center border-2 border-dashed border-slate-100 rounded-xl mt-4">
                            <div className="bg-slate-50 p-3 rounded-full mb-3">
                                <TrendingUp className="h-5 w-5 opacity-20" />
                            </div>
                            <p className="text-xs font-medium text-slate-400">Aucun patient</p>
                        </div>
                    ) : (
                        otherItems.map(item => {
                            const isWaitlist = item.source === 'waitlist';
                            // Match stats colors: Amber for waitlist, Blue for appointments
                            const baseBg = isWaitlist ? "bg-amber-500/10" : "bg-blue-500/10";
                            const hoverBg = isWaitlist ? "hover:bg-amber-500/20" : "hover:bg-blue-500/20";
                            const borderColor = isWaitlist ? "border-amber-300" : "border-blue-300";
                            const hoverBorder = isWaitlist ? "hover:border-amber-500" : "hover:border-blue-500";
                            const selectedBorder = isWaitlist ? "border-amber-500" : "border-blue-500";
                            const textColor = isWaitlist ? "text-amber-800" : "text-blue-800";
                            const secondaryTextColor = isWaitlist ? "text-amber-600/80" : "text-blue-600/80";

                            return (
                                <div
                                    key={`${item.source}-${item.patientId}`}
                                    onClick={() => onSelect(item)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border-2",
                                        selectedId === item.patientId
                                            ? cn(baseBg, selectedBorder, "shadow-md")
                                            : cn(baseBg, borderColor, hoverBg, hoverBorder, "hover:shadow-sm")
                                    )}
                                >
                                    {/* Patient name */}
                                    <span className={cn("font-bold text-sm truncate w-[30%] min-w-0", textColor)}>
                                        {item.patient?.name} {item.patient?.surname}
                                    </span>

                                    {/* Appointment Time */}
                                    <span className={cn("text-xs font-bold tabular-nums w-[10%] min-w-[50px]", textColor)}>
                                        {format(item.time, 'HH:mm')}
                                    </span>

                                    {/* Arrival Hour - only show if different from appointment time */}
                                    {item.arrivalTime && format(item.arrivalTime, 'HH:mm') !== format(item.time, 'HH:mm') ? (
                                        <span className={cn("text-xs tabular-nums w-[10%] min-w-[50px]", secondaryTextColor)}>
                                            {format(item.arrivalTime, 'HH:mm')}
                                        </span>
                                    ) : (
                                        <span className="w-[10%] min-w-[50px]" />
                                    )}

                                    {/* Age */}
                                    {item.patient?.dob && (
                                        <span className={cn("text-xs w-[10%] min-w-[40px]", secondaryTextColor)}>
                                            {getAge(item.patient.dob)}
                                        </span>
                                    )}

                                    {/* Phone */}
                                    {item.patient?.phone && (
                                        <span className={cn("text-xs w-[15%] min-w-[80px]", secondaryTextColor)}>
                                            {item.patient.phone}
                                        </span>
                                    )}

                                    {/* City */}
                                    {item.patient?.address?.city && (
                                        <span className={cn("text-xs w-[15%] min-w-[60px] truncate", secondaryTextColor)}>
                                            {item.patient.address.city}
                                        </span>
                                    )}

                                    {/* Dilation badge */}
                                    {item.needsDilation && (
                                        <Badge className="h-5 px-2.5 text-[10px] bg-purple-100 text-purple-700 border-0 shrink-0 font-semibold">
                                            Dil.
                                        </Badge>
                                    )}

                                    {/* Notes */}
                                    {item.notes && (
                                        <span className={cn("text-[11px] italic truncate max-w-[150px] shrink-0", secondaryTextColor)}>
                                            {item.notes}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}
