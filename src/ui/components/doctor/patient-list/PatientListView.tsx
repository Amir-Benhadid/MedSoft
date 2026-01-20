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
                {/* IN CONSULTATION SECTION */}
                {inConsultationItems.map(item => (
                    <div key={`consulting-${item.patientId}`} className="mb-3 mt-2">
                        <div
                            onClick={() => onSelect(item)}
                            className={cn(
                                "p-3 rounded-xl border transition-all cursor-pointer relative shadow-sm group",
                                selectedId === item.patientId
                                    ? "bg-blue-600 border-blue-600 shadow-blue-200"
                                    : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md"
                            )}
                        >
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                <span className={cn(
                                    "text-[9px] uppercase tracking-widest font-bold",
                                    selectedId === item.patientId ? "text-blue-100" : "text-blue-600"
                                )}>
                                    En cours
                                </span>
                                <div className={cn(
                                    "h-1.5 w-1.5 rounded-full animate-pulse",
                                    selectedId === item.patientId ? "bg-white" : "bg-blue-500"
                                )} />
                            </div>

                            <div className="flex items-center gap-3 mb-2">


                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "font-bold text-base leading-tight truncate",
                                        selectedId === item.patientId ? "text-white" : "text-slate-900"
                                    )}>
                                        {item.patient?.name} {item.patient?.surname}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[10px] mt-0.5">
                                        <span className={cn(
                                            "flex items-center gap-1 opacity-90",
                                            selectedId === item.patientId ? "text-white" : "text-slate-500"
                                        )}>
                                            <Clock className="h-3 w-3" />
                                            {format(item.time, 'HH:mm')}
                                        </span>
                                        {item.patient?.dob && (
                                            <span className={cn(
                                                "opacity-80 font-medium",
                                                selectedId === item.patientId ? "text-white" : "text-slate-400"
                                            )}>
                                                • {getAge(item.patient.dob)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-1">
                                <Button
                                    size="sm"
                                    className={cn(
                                        "h-7 px-3 text-[10px] font-semibold shadow-sm rounded-md",
                                        selectedId === item.patientId
                                            ? "bg-white text-blue-600 hover:bg-white/90"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(item);
                                    }}
                                >
                                    Reprendre <ChevronRight className="h-3 w-3 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Divider */}
                {inConsultationItems.length > 0 && (
                    <div className="py-3 flex items-center gap-3">
                        <div className="h-px bg-slate-100 flex-1" />
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">En Attente</span>
                        <div className="h-px bg-slate-100 flex-1" />
                    </div>
                )}

                {/* OTHER ITEMS */}
                <div className="flex flex-col gap-2">
                    {isLoading ? (
                        <div className="p-12 flex flex-col items-center text-slate-400 gap-3">
                            <div className="h-6 w-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-xs">Chargement...</span>
                        </div>
                    ) : otherItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-300 text-center border-2 border-dashed border-slate-100 rounded-xl">
                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                <TrendingUp className="h-6 w-6 opacity-20" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Aucun patient</p>
                        </div>
                    ) : (
                        otherItems.map(item => (
                            <div
                                key={`${item.source}-${item.patientId}`}
                                onClick={() => onSelect(item)}
                                className={cn(
                                    "flex items-start gap-4 p-4 cursor-pointer transition-all rounded-xl border border-transparent hover:border-slate-100 hover:shadow-sm",
                                    selectedId === item.patientId
                                        ? "bg-blue-50/50 border-blue-100 ring-1 ring-blue-100"
                                        : "bg-white"
                                )}
                            >


                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className={cn(
                                            "text-sm font-bold truncate",
                                            selectedId === item.patientId ? "text-blue-700" : "text-slate-900"
                                        )}>
                                            {item.patient?.name} {item.patient?.surname}
                                        </h3>
                                        <span className="text-[10px] font-semibold text-slate-400 tabular-nums bg-slate-50 px-1.5 py-0.5 rounded ml-2">
                                            {format(item.time, 'HH:mm')}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="secondary" className={cn("text-[10px] px-1.5 h-4 font-semibold rounded-md", getStatusColor(item.status))}>
                                            {getStatusLabel(item.status)}
                                        </Badge>
                                        {item.patient?.dob && (
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {getAge(item.patient.dob)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        {item.patient?.address?.city && (
                                            <span className="flex items-center gap-1 truncate max-w-[120px] text-[10px] font-medium opacity-80">
                                                <MapPin className="h-3 w-3" />
                                                {item.patient.address.city}
                                            </span>
                                        )}
                                    </div>

                                    {(item.needsDilation || item.notes) && (
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            {item.needsDilation && (
                                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-purple-50 text-purple-700 border-purple-100 font-medium rounded-md">
                                                    <Activity className="h-2.5 w-2.5 mr-1" /> Dilatation
                                                </Badge>
                                            )}
                                            {item.notes && (
                                                <span className="text-[10px] text-slate-500 italic truncate max-w-full bg-slate-50 px-1.5 py-0.5 rounded">
                                                    "{item.notes}"
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ScrollArea>
    );
}
