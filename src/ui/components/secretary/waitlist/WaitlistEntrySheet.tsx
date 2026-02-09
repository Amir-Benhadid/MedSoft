import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Textarea } from '@/ui/components/ui/textarea';
import { useCreateWaitlistEntry } from '@/ui/hooks/useWaitlist';
import { useCreatePatient, useUpdatePatient, usePatient, Patient } from '@/ui/hooks/usePatients';
import { PatientSelector } from '@/ui/components/patients/PatientSelector';
import { PatientForm } from '@/ui/components/patients/PatientForm';
import {
    Search, UserPlus, Clock, FileText, X, Save
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

// Reusing components from calendar as requested for consistency
import { CompactPatientCard } from '@/ui/components/secretary/calendar/components/CompactPatientCard';
import { CompactDilationControl } from '@/ui/components/secretary/calendar/components/CompactDilationControl';
import { CompactAntecedentsSection } from '@/ui/components/secretary/calendar/components/CompactAntecedentsSection';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { cn } from '@/ui/lib/utils';

const waitlistEntrySchema = z.object({
    notes: z.string().optional(),
    needs_dilation: z.boolean(),
    dilation_medicine: z.string().optional().nullable(),
    oph_ants: z.string().optional().nullable(),
    gen_ants: z.string().optional().nullable(),
    consultation_type_id: z.string().optional()
});

type WaitlistEntryFormValues = z.infer<typeof waitlistEntrySchema>;

interface WaitlistEntrySheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export function WaitlistEntrySheet({ isOpen, onClose }: WaitlistEntrySheetProps) {
    const createWaitlistEntry = useCreateWaitlistEntry();
    const createPatient = useCreatePatient();
    const updatePatient = useUpdatePatient();

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [view, setView] = useState<'selection' | 'form' | 'entry' | 'edit-patient'>('selection');
    const { appMode } = useConfig();
    const { data: consultationTypes = [] } = useConsultationTypes();

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<WaitlistEntryFormValues>({
        resolver: zodResolver(waitlistEntrySchema),
        defaultValues: {
            notes: '',
            needs_dilation: false,
            dilation_medicine: 'Mydriaticum',

            oph_ants: '',
            gen_ants: '',
            consultation_type_id: '1'
        }
    });

    const patientData = usePatient(selectedPatient?.id || null);

    useEffect(() => {
        if (isOpen) {
            setView('selection');
            setSelectedPatient(null);
            reset({
                notes: '',
                needs_dilation: false,
                dilation_medicine: 'Mydriaticum',
                oph_ants: '',
                gen_ants: '',
                consultation_type_id: '1'
            });
        }
    }, [isOpen, reset]);

    // Sync fetched patient data to state
    useEffect(() => {
        if (patientData.data && selectedPatient) {
            setSelectedPatient(patientData.data);
            reset((prev) => ({
                ...prev,
                oph_ants: patientData.data?.oph_ants || '',
                gen_ants: patientData.data?.gen_ants || '',
            }));
        }
    }, [patientData.data, selectedPatient, reset]);

    const handlePatientSelect = useCallback((patient: Patient) => {
        setSelectedPatient(patient);
        setView('entry');
    }, []);

    const handlePatientCreate = useCallback(async (data: any) => {
        try {
            const newPatient = await createPatient.mutateAsync(data);
            setSelectedPatient(newPatient);
            setView('entry');
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
            setView('entry');
        } catch (error) {
            console.error("Failed to update patient", error);
        }
    }, [selectedPatient, updatePatient]);

    const onSubmit = useCallback(async (data: WaitlistEntryFormValues) => {
        if (!selectedPatient) return;

        try {
            // Update patient antecedents if they changed
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

            await createWaitlistEntry.mutateAsync({
                patient_id: selectedPatient.id,
                needs_dilation: data.needs_dilation,
                dilation_medicine: data.needs_dilation ? (data.dilation_medicine || 'Mydriaticum') : undefined,
                notes: data.notes,
                consultation_type_id: data.consultation_type_id ? parseInt(data.consultation_type_id) : undefined
            });

            onClose();
        } catch (error) {
            console.error("Failed to add to waitlist", error);
        }
    }, [selectedPatient, updatePatient, createWaitlistEntry, onClose]);

    const isSubmitting = useMemo(() =>
        createWaitlistEntry.isPending,
        [createWaitlistEntry.isPending]
    );

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-[480px] overflow-hidden p-0 flex flex-col">
                {/* Header */}
                <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10 backdrop-blur-sm flex-none">
                    <SheetTitle className="text-lg font-bold flex items-center gap-2 text-blue-900">
                        <div className="p-1.5 rounded-lg bg-blue-100">
                            <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        Ajouter à la file d'attente
                    </SheetTitle>
                </SheetHeader>

                <div className={cn(
                    "p-4 flex-1",
                    view === 'selection' ? "overflow-hidden flex flex-col" : "overflow-y-auto"
                )}>
                    {view === 'selection' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-5 duration-200 h-full flex flex-col">
                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg flex-none">
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
                                onCancel={() => setView('entry')}
                            />
                        </div>
                    )}

                    {view === 'entry' && selectedPatient && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-200">
                            {/* Patient Card */}
                            <CompactPatientCard
                                patient={selectedPatient}
                                isLoading={patientData.isLoading}
                                onChangePatient={() => setView('selection')}
                                onEdit={() => setView('edit-patient')}
                            />

                            {/* Dilation Control */}
                            {appMode !== 'secretary' && <CompactDilationControl control={control} />}

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500">Activité</label>
                                <Select
                                    value={watch('consultation_type_id')}
                                    onValueChange={(val) => setValue('consultation_type_id', val)}
                                >
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Sélectionner l'activité" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999]">
                                        {consultationTypes.map(type => (
                                            <SelectItem key={type.id} value={type.id.toString()} className="text-xs">
                                                {type.label} - {type.amount} DA
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>



                            {/* Antecedents */}
                            <CompactAntecedentsSection register={register} errors={errors} control={control} />

                            {/* Notes */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
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

                {/* Footer */}
                {view === 'entry' && selectedPatient && (
                    <SheetFooter className="px-4 py-3 border-t bg-slate-50 sticky bottom-0 backdrop-blur-sm">
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
                                className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSubmit(onSubmit)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5"></div>
                                        Ajout...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-1.5" />
                                        Ajouter
                                    </>
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
