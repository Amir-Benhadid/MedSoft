import { memo } from 'react';
import { Card, CardContent } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import { Button } from "@/ui/components/ui/button";
import { Eye, Trash2, Edit2, Play, Circle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConfig } from "@/ui/contexts/ConfigContext";

export interface WaitlistEntry {
    id: string;
    patient_id: string;
    patient?: {
        name: string;
        surname: string;
    };
    patient_name?: string;
    patient_surname?: string;
    arrived_at: string;
    state: string;
    type?: string;
    notes?: string;
    needs_dilation: boolean;
    dilation_status?: string | null;
    dilation_type?: string | null;
}

interface WaitlistCardProps {
    entry: WaitlistEntry;
    onRemove: (id: string) => void;
    onToggleDilation: (entry: WaitlistEntry) => void;
    onUpdateStatus: (id: string, state: string) => void;
    onClick: (entry: WaitlistEntry) => void;
}

export const WaitlistCard = memo(({ entry, onRemove, onToggleDilation, onUpdateStatus, onClick }: WaitlistCardProps) => {
    const { appMode } = useConfig();
    const arrivedAt = new Date(entry.arrived_at);
    const timeAgo = formatDistanceToNow(arrivedAt, { addSuffix: true, locale: fr });

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'in_consultation': return 'bg-primary/5 border-primary/20';
            case 'completed': return 'bg-orange-500/5 border-orange-500/20';
            case 'paid': return 'bg-emerald-500/5 border-emerald-500/20';
            case 'creance': return 'bg-red-500/5 border-red-500/20';
            default: return 'bg-secondary/30 hover:bg-secondary/50 border-transparent';
        }
    };

    const getStatusBadge = (state: string) => {
        switch (state) {
            case 'in_consultation': return <Badge variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/20">En cours</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20">Terminé</Badge>;
            case 'paid': return <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20">Payé</Badge>;
            default: return <Badge variant="outline" className="text-muted-foreground border-border">En attente</Badge>;
        }
    };

    return (
        <div
            className={cn(
                "group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
                entry.state === 'waiting' && "hover:border-blue-300"
            )}
            onClick={() => onClick(entry)}
        >
            {/* Status Strip - Thinner and more subtle */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                entry.state === 'waiting' && "bg-slate-300",
                entry.state === 'in_consultation' && "bg-blue-500",
                entry.state === 'completed' && "bg-orange-500",
                entry.state === 'paid' && "bg-emerald-500",
            )} />

            <div className="p-3 pl-4 flex flex-col gap-2">
                {/* Top Row: Name & Status */}
                <div className="flex justify-between items-start">
                    <div className="min-w-0 pr-2">
                        <h3 className="text-[15px] font-bold text-slate-900 leading-tight truncate">
                            {entry.patient?.name || entry.patient_name} {entry.patient?.surname || entry.patient_surname}
                        </h3>
                        {entry.notes && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                                {entry.notes}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0">
                        {getStatusBadge(entry.state)}
                    </div>
                </div>

                {/* Bottom Row: Details & Actions */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={cn(
                            "h-5 px-1.5 text-[10px] font-medium border bg-slate-50 text-slate-600 gap-1",
                            entry.state === 'waiting' && timeAgo.includes("heure") && "bg-amber-50 text-amber-700 border-amber-200"
                        )}>
                            <Clock className="w-3 h-3" />
                            {timeAgo}
                        </Badge>

                        {entry.needs_dilation && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] gap-1 text-purple-700 bg-purple-50 border-purple-200">
                                <Eye className="w-3 h-3" />
                                <span className="hidden sm:inline">Dilatation</span>
                            </Badge>
                        )}
                    </div>

                    {/* Quick Actions (Visible on Hover/Touch) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {appMode !== 'secretary' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleDilation(entry);
                                }}
                            >
                                <Eye className="h-3 w-3" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(entry.id);
                            }}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});

WaitlistCard.displayName = 'WaitlistCard';
