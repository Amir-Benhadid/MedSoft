import { memo } from 'react';
import { EventContentArg } from '@fullcalendar/core';
import { Badge } from '@/ui/components/ui/badge';
import { Clock, Eye, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { useConfig } from '@/ui/contexts/ConfigContext';

interface EnhancedCalendarEventProps {
    event: EventContentArg['event'];
    isDayView: boolean;
    showArrivalAlways?: boolean;
}

const STATE_CONFIG = {
    booked: {
        border: 'border-blue-500',
        text: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/5 hover:bg-blue-500/10',
        icon: Clock,
        label: 'RDV'
    },
    present: {
        border: 'border-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
        icon: CheckCircle2,
        label: 'Présent'
    },
    overdue: {
        border: 'border-red-500',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500/5 hover:bg-red-500/10',
        icon: AlertCircle,
        label: 'Retard'
    },
    completed: {
        border: 'border-slate-400',
        text: 'text-slate-500 dark:text-slate-400',
        bg: 'bg-slate-500/5 hover:bg-slate-500/10',
        icon: CheckCircle2,
        label: 'Terminé'
    },
} as const;

export const EnhancedCalendarEvent = memo(({ event, isDayView, showArrivalAlways }: EnhancedCalendarEventProps) => {
    const { appMode } = useConfig();
    const state = event.extendedProps?.state || 'booked';
    const needsDilation = event.extendedProps?.needs_dilation;
    const arrivedAt = event.extendedProps?.arrived_at;
    const config = STATE_CONFIG[state as keyof typeof STATE_CONFIG] || STATE_CONFIG.booked;
    const Icon = config.icon;

    if (!isDayView) {
        // Month view - ultra compact
        return (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-border border-l-4 ${config.border.replace('border-', 'border-l-')} ${config.text} text-[10px] font-bold truncate w-full shadow-sm`}>
                <span className="truncate">{event.title}</span>
                {needsDilation && appMode !== 'secretary' && <Eye className="h-3 w-3 shrink-0 ml-auto opacity-50" />}
            </div>
        );
    }

    // Day/Week view - compact with more info
    return (
        <div className={`h-full w-full flex flex-col p-1 sm:p-1.5 rounded-r-lg border-l-[3px] ${config.border} ${config.bg} border border-t-0 border-b-0 border-r-0 shadow-sm transition-all overflow-hidden leading-tight group`}>
            {/* Header: Time + Icon */}
            <div className="flex items-center justify-between gap-1 mb-0.5">
                <div className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider ${config.text} opacity-90`}>
                    <Icon className="h-3 w-3" />
                    <span className="truncate">
                        {event.start?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                {needsDilation && appMode !== 'secretary' && (
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" title="Dilatation" />
                )}
            </div>

            {/* Content: Name */}
            <div className="font-bold text-xs sm:text-[13px] text-foreground truncate leading-snug">
                {event.title}
            </div>

            {/* Footer: Arrival (if needed) */}
            {(arrivedAt || showArrivalAlways) && arrivedAt && (
                <div className="mt-auto pt-1 flex items-center text-[10px] text-muted-foreground font-medium truncate">
                    <User className="h-2.5 w-2.5 mr-1 text-muted-foreground/70" />
                    <span className="truncate">
                        Arr. {new Date(arrivedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )}
        </div>
    );
});

EnhancedCalendarEvent.displayName = 'EnhancedCalendarEvent';
