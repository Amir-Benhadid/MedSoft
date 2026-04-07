import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { Textarea } from '@/ui/components/ui/textarea';
import { Badge } from '@/ui/components/ui/badge';
import { useCreateAppointment, useUpdateAppointment, Appointment } from '@/ui/hooks/useAppointments';
import { useCreatePatient, useUpdatePatient, usePatient, Patient } from '@/ui/hooks/usePatients';
import { PatientSelector } from '@/ui/components/patients/PatientSelector';
import { PatientForm } from '@/ui/components/patients/PatientForm';
import {
    Search, User, Clock, FileText, Calendar as CalendarIcon,
    Phone, MapPin, Eye, Droplet, Activity, Save, X,
    UserPlus, ArrowLeft, Hash, Edit2, ChevronRight
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

// Compact Modular Components
import { CompactPatientCard } from '@/ui/components/secretary/calendar/components/CompactPatientCard';
import { CompactDilationControl } from '@/ui/components/secretary/calendar/components/CompactDilationControl';
import { CompactAntecedentsSection } from '@/ui/components/secretary/calendar/components/CompactAntecedentsSection';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { getLocalISOString } from '@/ui/lib/time';
import { cn } from '@/ui/lib/utils';

const appointmentSchema = z.object({
    title: z.string().optional(),
    start_time: z.string().min(1, 'La date de début est requise'),
    end_time: z.string().min(1, 'La date de fin est requise'),
    notes: z.string().optional(),
    needs_dilation: z.boolean(),
    dilation_status: z.string().optional().nullable(),
    oph_ants: z.string().optional().nullable(),
    gen_ants: z.string().optional().nullable(),
    consultation_type_id: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface CalendarAppointmentSheetProps {
    isOpen?: boolean;
    onClose: () => void;
    appointment?: Appointment | null;
    defaultDate?: Date;
}

const formatDateTimeLocal = (dateString?: string | Date) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return getLocalISOString(date).slice(0, 16);
};

export function CalendarAppointmentContent({ onClose, appointment, defaultDate }: Omit<CalendarAppointmentSheetProps, 'isOpen'>) {
    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const createPatient = useCreatePatient();
    const updatePatient = useUpdatePatient();

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [view, setView] = useState<'selection' | 'form' | 'appointment' | 'edit-patient'>('selection');

    const { data: consultationTypes = [] } = useConsultationTypes();

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            title: '',
            start_time: '',
            end_time: '',
            notes: '',
            needs_dilation: false,
            dilation_status: '',
            oph_ants: '',
            gen_ants: '',
            consultation_type_id: '1'
        }
    });

    const patientData = usePatient(selectedPatient?.id || appointment?.patient_id || null);

    useEffect(() => {
        if (appointment) {
            setView('appointment');
            reset({
                title: appointment.title || '',
                start_time: formatDateTimeLocal(appointment.start_time),
                end_time: formatDateTimeLocal(appointment.end_time),
                notes: appointment.notes || '',
                needs_dilation: appointment.needs_dilation,
                dilation_status: appointment.dilation_status || '',
                oph_ants: '',
                gen_ants: '',
                consultation_type_id: appointment.consultation_type_id ? appointment.consultation_type_id.toString() : '1'
            });
        } else {
            setView('selection');
            setSelectedPatient(null);
            const start = defaultDate ? new Date(defaultDate) : new Date();
            const end = new Date(start);
            end.setHours(end.getHours() + 1);

            reset({
                title: '',
                start_time: formatDateTimeLocal(start),
                end_time: formatDateTimeLocal(end),
                notes: '',
                needs_dilation: false,
                dilation_status: '',
                oph_ants: '',
                gen_ants: '',
                consultation_type_id: '1'
            });
        }
    }, [appointment, defaultDate, reset]);

    useEffect(() => {
        if (patientData.data && (appointment || selectedPatient)) {
            setSelectedPatient(patientData.data);
            reset((prev) => ({
                ...prev,
                oph_ants: patientData.data?.oph_ants || '',
                gen_ants: patientData.data?.gen_ants || '',
            }));
        }
    }, [patientData.data, appointment, selectedPatient, reset]);

    // Enforce 00 minutes on start time and sync end time
    const watchedStartTime = watch('start_time');
    useEffect(() => {
        if (!watchedStartTime) return;

        const date = new Date(watchedStartTime);
        if (isNaN(date.getTime())) return;

        // Enforce minutes to 00
        if (date.getMinutes() !== 0 || date.getSeconds() !== 0) {
            date.setMinutes(0, 0, 0);
            const cleanStart = getLocalISOString(date).slice(0, 16);
            if (cleanStart !== watchedStartTime) {
                setValue('start_time', cleanStart);
                return; // Will re-run effect with clean time
            }
        }

        // Sync end time (always 1 hour after start)
        const endDate = new Date(date.getTime() + 60 * 60 * 1000);
        const desiredEnd = getLocalISOString(endDate).slice(0, 16);
        setValue('end_time', desiredEnd);

    }, [watchedStartTime, setValue]);

    const handlePatientSelect = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        setView('appointment');
    }, []);

    const handlePatientCreate = useCallback(async (data: any) => {
        try {
            const newPatient = await createPatient.mutateAsync(data);
            setSelectedPatient(newPatient);
            setView('appointment');
        } catch (error) {
            console.error("Failed to create patient", error);
        }
    }, [createPatient]);

    const handlePatientUpdate = useCallback(async (data: any) => {
        if (!selectedPatient) return;
        try {
            const updatedPatient = await updatePatient.mutateAsync({
                id: selectedPatient.id,
                updates: data
            });
            setSelectedPatient(updatedPatient);
            setView('appointment');
        } catch (error) {
            console.error("Failed to update patient", error);
        }
    }, [selectedPatient, updatePatient]);

    const onSubmit = useCallback(async (data: AppointmentFormValues) => {
        if (!selectedPatient) return;

        try {
            const patientChanged =
                data.oph_ants !== selectedPatient.oph_ants ||
                data.gen_ants !== selectedPatient.gen_ants;

            if (patientChanged) {
                await updatePatient.mutateAsync({
                    id: selectedPatient.id,
                    updates: {
                        oph_ants: data.oph_ants,
                        gen_ants: data.gen_ants,
                    }
                });
            }

            const title = `${selectedPatient.surname} ${selectedPatient.name}`;
            const appointmentData = {
                title,
                start_time: getLocalISOString(new Date(data.start_time)),
                end_time: getLocalISOString(new Date(data.end_time)),
                notes: data.notes,
                needs_dilation: data.needs_dilation,
                dilation_status: data.needs_dilation ? data.dilation_status : null,
                patient_id: selectedPatient.id,
                consultation_type_id: data.consultation_type_id ? parseInt(data.consultation_type_id) : undefined
            };

            if (appointment) {
                await updateAppointment.mutateAsync({
                    id: appointment.id,
                    updates: appointmentData
                });
            } else {
                await createAppointment.mutateAsync({
                    ...appointmentData,
                    state: 'booked',
                });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save appointment", error);
        }
    }, [selectedPatient, appointment, updatePatient, updateAppointment, createAppointment, onClose]);

    const isSubmitting = useMemo(() =>
        createAppointment.isPending || updateAppointment.isPending,
        [createAppointment.isPending, updateAppointment.isPending]
    );

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Compact Header */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 sticky top-0 z-10 backdrop-blur-sm">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                    </div>
                    {appointment ? 'Modifier RDV' : 'Nouveau RDV'}
                </h2>
            </div>

            <div className={cn(
                "p-4 flex-1",
                view === 'selection' ? "overflow-hidden flex flex-col" : "overflow-y-auto"
            )}>
                {view === 'selection' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-5 duration-200 h-full flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/5 px-3 py-2 rounded-lg flex-none">
                            Sélectionner patient
                        </div>
                        <div className="flex-1 min-h-0">
                            <PatientSelector
                                onSelect={handlePatientSelect}
                                onCreateNew={() => setView('form')}
                            />
                        </div>
                    </div>
                )}

                {view === 'form' && (
                    <div className="animate-in fade-in slide-in-from-right-5 duration-200">
                        <PatientForm
                            isLoading={createPatient.isPending}
                            onSubmit={handlePatientCreate}
                            onCancel={() => setView('selection')}
                        />
                    </div>
                )}

                {view === 'edit-patient' && selectedPatient && (
                    <div className="animate-in fade-in slide-in-from-right-5 duration-200">
                        <PatientForm
                            initialData={selectedPatient}
                            isLoading={updatePatient.isPending}
                            onSubmit={handlePatientUpdate}
                            onCancel={() => setView('appointment')}
                        />
                    </div>
                )}


                {view === 'appointment' && selectedPatient && (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 animate-in fade-in slide-in-from-right-5 duration-200">
                        {/* Compact Patient Card */}
                        <CompactPatientCard
                            patient={selectedPatient}
                            onChangePatient={() => setView('selection')}
                            onEdit={() => setView('edit-patient')}
                        />

                        {/* Time Inputs - Compact Grid */}
                        <div className="space-y-1 mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Activity className="h-3 w-3" />
                                Activité
                            </div>
                            <Select
                                value={watch('consultation_type_id')}
                                onValueChange={(val) => setValue('consultation_type_id', val)}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Sélectionner l'activité" />
                                </SelectTrigger>
                                <SelectContent className="z-[9999]">
                                    {consultationTypes.map(type => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.label} - {type.amount} DA
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    Début
                                </div>
                                <Input
                                    type="datetime-local"
                                    step="3600"
                                    {...register('start_time')}
                                    className="h-9 text-sm"
                                />
                                {errors.start_time && <span className="text-destructive text-xs">{errors.start_time.message}</span>}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    Fin
                                </div>
                                <Input
                                    type="datetime-local"
                                    step="3600"
                                    {...register('end_time')}
                                    className="h-9 text-sm"
                                />
                                {errors.end_time && <span className="text-destructive text-xs">{errors.end_time.message}</span>}
                            </div>
                        </div>

                        {/* Compact Antecedents */}
                        <CompactAntecedentsSection register={register} errors={errors} control={control} />

                        {/* Notes - Compact */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                Notes
                            </div>
                            <Textarea
                                {...register('notes')}
                                rows={3}
                                className="text-sm resize-none"
                            />
                        </div>
                    </form>
                )}
            </div>

            {/* Compact Footer with Icon Buttons */}
            {view === 'appointment' && selectedPatient && (
                <div className="px-4 py-3 border-t bg-muted/30 sticky bottom-0 backdrop-blur-sm mt-auto">
                    <div className="flex gap-2 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-9"
                        >
                            <X className="h-4 w-4 mr-1.5" />
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-9"
                            onClick={handleSubmit(onSubmit)}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></div>
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-1.5" />
                                    {appointment ? 'Modifier' : 'Créer'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function CalendarAppointmentSheet(props: CalendarAppointmentSheetProps) {
    if (!props.isOpen) return null; // Simple safe guard used to be controlled by Sheet open prop

    return (
        <Sheet open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-hidden p-0">
                <CalendarAppointmentContent {...props} />
            </SheetContent>
        </Sheet>
    );
}
