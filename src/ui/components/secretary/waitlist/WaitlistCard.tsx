import { memo } from 'react';
import { Card, CardContent } from "@/ui/components/ui/card";
import { Badge } from "@/ui/components/ui/badge";
import { Button } from "@/ui/components/ui/button";
import { Eye, Trash2, Edit2, Play, Circle, CheckCircle2 } from "lucide-react";
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
            case 'in_consultation': return 'bg-blue-50 border-blue-200';
            case 'completed': return 'bg-orange-50 border-orange-200';
            case 'paid': return 'bg-green-50 border-green-200';
            case 'creance': return 'bg-pink-50 border-pink-200';
            default: return 'bg-white hover:bg-slate-50';
        }
    };

    const getStatusBadge = (state: string) => {
        switch (state) {
            case 'in_consultation': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">En cours</Badge>;
            case 'completed': return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Terminé</Badge>;
            case 'paid': return <Badge variant="secondary" className="bg-green-100 text-green-700">Payé</Badge>;
            default: return <Badge variant="outline" className="text-slate-500">En attente</Badge>;
        }
    };

    return (
        <Card
            className={cn(
                "cursor-pointer mb-2 waitlist-card group relative overflow-hidden",
                getStatusColor(entry.state)
            )}
            onClick={() => onClick(entry)}
        >
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                entry.state === 'waiting' && "bg-slate-300",
                entry.state === 'in_consultation' && "bg-blue-500",
                entry.state === 'completed' && "bg-orange-500",
                entry.state === 'paid' && "bg-green-500",
            )} />

            <CardContent className="p-3 pl-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">
                                {entry.patient?.name || entry.patient_name} {entry.patient?.surname || entry.patient_surname}
                            </span>
                            {getStatusBadge(entry.state)}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Play className="h-3 w-3" />
                                {timeAgo}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>{arrivedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {entry.notes && (
                            <div className="text-xs text-slate-500 mt-1 truncate italic">
                                {entry.notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Bar - Visible on Hover (or always visible if needed) */}
                <div className="flex items-center gap-1 mt-3 justify-end opacity-100 transition-opacity">
                    {appMode !== 'secretary' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-7 w-7",
                                (entry.needs_dilation) ? "text-purple-600 bg-purple-50" : "text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                            )}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleDilation(entry);
                            }}
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    {entry.state === 'waiting' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600 hover:bg-green-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(entry.id, 'in_consultation');
                            }}
                        >
                            <Play className="h-3.5 w-3.5" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(entry.id);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

WaitlistCard.displayName = 'WaitlistCard';
