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
        color: 'bg-blue-500',
        border: 'border-blue-600',
        text: 'text-blue-50',
        icon: Clock,
        label: 'RDV'
    },
    present: {
        color: 'bg-green-500',
        border: 'border-green-600',
        text: 'text-green-50',
        icon: CheckCircle2,
        label: 'Présent'
    },
    overdue: {
        color: 'bg-red-500',
        border: 'border-red-600',
        text: 'text-red-50',
        icon: AlertCircle,
        label: 'Retard'
    },
    completed: {
        color: 'bg-gray-400',
        border: 'border-gray-500',
        text: 'text-gray-50',
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
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${config.color} ${config.text} text-xs font-medium truncate w-full`}>
                <Icon className="h-3 w-3 shrink-0" />
                <span className="truncate">{event.title}</span>
                {needsDilation && appMode !== 'secretary' && <Eye className="h-3 w-3 shrink-0 ml-auto" />}
            </div>
        );
    }

    // Day/Week view - compact with more info
    return (
        <div className={`h-full flex flex-col gap-0.5 sm:gap-1 p-1.5 sm:p-2 rounded-lg border-l-4 ${config.border} ${config.color} ${config.text} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="font-bold text-xs sm:text-sm truncate">{event.title}</span>
                </div>
                {needsDilation && appMode !== 'secretary' && (
                    <Badge className="h-4 sm:h-5 px-1 sm:px-1.5 bg-white/20 text-white border-white/30 shrink-0 text-[10px] sm:text-xs">
                        <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs opacity-90">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>
                    {event.start?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {event.end?.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {(arrivedAt || showArrivalAlways) && arrivedAt && (
                <Badge className="text-[10px] sm:text-xs h-4 sm:h-5 bg-white/20 text-white border-white/30 w-fit px-1 sm:px-1.5">
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                    Arrivé {new Date(arrivedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Badge>
            )}
        </div>
    );
});

EnhancedCalendarEvent.displayName = 'EnhancedCalendarEvent';
