import { memo } from 'react';
import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import {
    Calendar as CalendarIcon,
    Clock,
    Eye,
    Filter,
    Search,
    Plus
} from 'lucide-react';
import { useConfig } from '@/ui/contexts/ConfigContext';

interface CalendarQuickActionsProps {
    onNewAppointment: () => void;
    onFilterToggle?: () => void;
    onSearchToggle?: () => void;
    appointmentCount?: number;
    dilationCount?: number;
}

export const CalendarQuickActions = memo(({
    onNewAppointment,
    onFilterToggle,
    onSearchToggle,
    appointmentCount = 0,
    dilationCount = 0
}: CalendarQuickActionsProps) => {
    const { appMode } = useConfig();
    return (
        <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm mb-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold">Aujourd'hui</span>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="h-7 px-3 text-xs font-semibold bg-slate-100 text-slate-700 border-slate-200">
                        <Clock className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                        {appointmentCount} RDV
                    </Badge>

                    {dilationCount > 0 && appMode !== 'secretary' && (
                        <Badge className="h-7 px-3 text-xs font-semibold bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">
                            <Eye className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                            {dilationCount} Dilat.
                        </Badge>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onSearchToggle && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={onSearchToggle}
                        title="Rechercher"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                )}

                {onFilterToggle && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={onFilterToggle}
                        title="Filtrer"
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    size="sm"
                    className="h-8 px-3 gap-1.5"
                    onClick={onNewAppointment}
                >
                    <Plus className="h-4 w-4" />
                    <span className="text-xs font-semibold">RDV</span>
                </Button>
            </div>
        </div>
    );
});

CalendarQuickActions.displayName = 'CalendarQuickActions';
