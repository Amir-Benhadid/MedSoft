import { memo } from 'react';

import { Button } from '@/ui/components/ui/button';
import { Badge } from '@/ui/components/ui/badge';
import { Patient } from '@/ui/hooks/usePatients';
import { User, Calendar, Phone, MapPin, History, Edit2 } from 'lucide-react';
import { useConfig } from '@/ui/contexts/ConfigContext';

interface CompactPatientCardProps {
    patient: Patient;
    isLoading?: boolean;
    onChangePatient: () => void;
    onEdit?: () => void;
}

import { formatDateDisplay, calculateAge } from '@/ui/lib/time';
import { cn } from '@/ui/lib/utils';

export const CompactPatientCard = memo(({ patient, isLoading, onChangePatient, onEdit }: CompactPatientCardProps) => {
    const { appMode } = useConfig();

    const showAnts = appMode === 'secretary' ? !!patient.gen_ants : (!!patient.oph_ants || !!patient.gen_ants);

    return (
        <div className="relative flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
            {isLoading && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                    <div className="flex gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
                    </div>
                </div>
            )}

            <div
                className={cn("flex-1 min-w-0 text-left", onEdit && "cursor-pointer hover:opacity-70 transition-opacity select-none")}
                onClick={() => onEdit?.()}
            >
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm truncate flex items-center gap-2">
                        {patient.surname} {patient.name}
                        {onEdit && <Edit2 className="w-3 h-3 text-slate-400 opacity-50" />}
                    </h4>
                    {patient.dob && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                            {calculateAge(patient.dob)}a
                        </Badge>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {patient.dob && (
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateDisplay(patient.dob)}
                        </span>
                    )}
                    {patient.phone_number && (
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone_number}
                        </span>
                    )}
                </div>
                {showAnts && (
                    <div className="flex items-center gap-1 mt-1">
                        <History className="h-3 w-3 text-amber-600" />
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Ants</span>
                    </div>
                )}
            </div>

            <div className="flex gap-1 shrink-0">
                {onEdit && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={onEdit}
                        title="Modifier les informations"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                )}
                {/* Let's verify imports first. I'll just add the button for now and fix icons later if needed. Use 'Edit2' for edit if available or just reuse specific icons. */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={onChangePatient}
                    title="Changer de patient"
                >
                    {/* The original code used User icon. Let's keep it but maybe we should import Edit. */}
                    <User className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

CompactPatientCard.displayName = 'CompactPatientCard';
