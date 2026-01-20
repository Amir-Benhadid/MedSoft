import React, { useEffect, useRef } from 'react';
import { Button } from '@/ui/components/ui/button';
import { CheckCircle, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Appointment } from '@/ui/hooks/useAppointments';
import { cn } from '@/ui/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConfig } from '@/ui/contexts/ConfigContext';

interface CalendarMenuProps {
    appointment: Appointment;
    position: { x: number; y: number } | null;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onMarkPresent: () => void;
    onToggleDilation: () => void;
}

export const CalendarMenu: React.FC<CalendarMenuProps> = ({
    appointment,
    position,
    onClose,
    onEdit,
    onDelete,
    onMarkPresent,
    onToggleDilation
}) => {
    const { appMode } = useConfig();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (position) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [position, onClose]);

    if (!position || !appointment) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[220px] bg-popover rounded-md border shadow-md p-1 animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: position.y,
                left: position.x,
            }}
        >
            <div className="px-2 py-1.5 text-sm font-semibold border-b mb-1">
                {appointment.title || 'Rendez-vous'}
                <div className="text-xs text-muted-foreground font-normal">
                    {format(new Date(appointment.start_time), 'HH:mm', { locale: fr })} - {format(new Date(appointment.end_time), 'HH:mm', { locale: fr })}
                </div>
            </div>

            <div className="flex flex-col gap-0.5">
                {appointment.state === 'booked' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 px-2 text-sm font-normal"
                        onClick={() => { onMarkPresent(); onClose(); }}
                    >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Marquer comme présent
                    </Button>
                )}

                {(appointment.state === 'present' || appointment.state === 'in_consultation') && appMode !== 'secretary' && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-8 px-2 text-sm font-normal"
                        onClick={() => { onToggleDilation(); onClose(); }}
                    >
                        <Eye className={cn("mr-2 h-4 w-4", appointment.needs_dilation ? "text-blue-500 fill-blue-100" : "text-gray-500")} />
                        {appointment.needs_dilation ? 'Annuler dilation' : 'Marquer pour dilatation'}
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 px-2 text-sm font-normal"
                    onClick={() => { onEdit(); onClose(); }}
                >
                    <Edit className="mr-2 h-4 w-4 text-foreground" />
                    Modifier le rendez-vous
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 px-2 text-sm font-normal"
                    onClick={() => {
                        const event = new CustomEvent('openPatientFile', {
                            detail: { patientId: appointment.patient_id }
                        });
                        window.dispatchEvent(event);
                        onClose();
                    }}
                >
                    <FileText className="mr-2 h-4 w-4 text-foreground" />
                    Dossier Patient
                </Button>

                <div className="border-t my-1"></div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 px-2 text-sm font-normal text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => { onDelete(); onClose(); }}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                </Button>
            </div>
        </div>
    );
};
