import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/components/ui/dialog';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { useCreateAppointment, useUpdateAppointment, Appointment } from '@/ui/hooks/useAppointments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

const appointmentSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    start_time: z.string().min(1, 'La date de début est requise'),
    end_time: z.string().min(1, 'La date de fin est requise'),
    notes: z.string().optional(),
    consultation_type_id: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface CalendarAppointmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    appointment?: Appointment | null;
    defaultDate?: Date;
}

const formatDateTimeLocal = (dateString?: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
};

export function CalendarAppointmentDialog({ isOpen, onClose, appointment, defaultDate }: CalendarAppointmentDialogProps) {
    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const { data: consultationTypes = [] } = useConsultationTypes();

    const { register, handleSubmit, reset, getValues, formState: { errors } } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            title: '',
            start_time: '',
            end_time: '',
            notes: '',
            consultation_type_id: '1' // Default to standard
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (appointment) {
                // Edit mode
                reset({
                    title: appointment.title || '',
                    start_time: formatDateTimeLocal(appointment.start_time),
                    end_time: formatDateTimeLocal(appointment.end_time),
                    notes: appointment.notes || '',
                    consultation_type_id: appointment.consultation_type_id?.toString() || '1'
                });
            } else if (defaultDate) {
                // Create mode with default date
                const start = new Date(defaultDate);
                const end = new Date(defaultDate);
                end.setHours(end.getHours() + 1);
                reset({
                    title: '',
                    start_time: formatDateTimeLocal(start),
                    end_time: formatDateTimeLocal(end),
                    notes: ''
                });
            } else {
                // Create mode default (now)
                const start = new Date();
                const end = new Date();
                end.setHours(end.getHours() + 1);
                reset({
                    title: '',
                    start_time: formatDateTimeLocal(start),
                    end_time: formatDateTimeLocal(end),
                    notes: ''
                });
            }
        }
    }, [isOpen, appointment, defaultDate, reset]);

    const onSubmit = async (data: AppointmentFormValues) => {
        try {
            if (appointment) {
                await updateAppointment.mutateAsync({
                    id: appointment.id,
                    updates: {
                        title: data.title,
                        start_time: new Date(data.start_time).toISOString(),
                        end_time: new Date(data.end_time).toISOString(),
                        notes: data.notes,
                        consultation_type_id: data.consultation_type_id ? parseInt(data.consultation_type_id) : undefined
                    }
                });
            } else {
                await createAppointment.mutateAsync({
                    title: data.title,
                    start_time: new Date(data.start_time).toISOString(),
                    end_time: new Date(data.end_time).toISOString(),
                    notes: data.notes,
                    state: 'booked',
                    needs_dilation: false,
                    patient_id: "00000000-0000-0000-0000-000000000000", // Default logic
                    consultation_type_id: data.consultation_type_id ? parseInt(data.consultation_type_id) : undefined
                });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save appointment", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{appointment ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous'}</DialogTitle>
                    <DialogDescription>
                        {appointment ? 'Modifiez les détails du rendez-vous.' : 'Remplissez les détails pour créer un nouveau rendez-vous.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Titre / Patient</Label>
                        <Input id="title" {...register('title')} placeholder="Nom du patient" />
                        {errors.title && <span className="text-destructive text-sm">{errors.title.message}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label>Type de consultation</Label>
                        <Select
                            onValueChange={(val) => reset({ ...getValues(), consultation_type_id: val })}
                            defaultValue={getValues('consultation_type_id')}
                            value={getValues('consultation_type_id')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                {consultationTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                        {type.label} - {type.amount} DA
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start">Début</Label>
                            <Input id="start" type="datetime-local" {...register('start_time')} />
                            {errors.start_time && <span className="text-destructive text-sm">{errors.start_time.message}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="end">Fin</Label>
                            <Input id="end" type="datetime-local" {...register('end_time')} />
                            {errors.end_time && <span className="text-destructive text-sm">{errors.end_time.message}</span>}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" {...register('notes')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit">{appointment ? 'Mettre à jour' : 'Enregistrer'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    );
}
