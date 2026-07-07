import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/ui/components/ui/sheet';
import { Button } from '@/ui/components/ui/button';
import { Textarea } from '@/ui/components/ui/textarea';
import { useCreateWaitlistEntry } from '@/ui/hooks/useWaitlist';
import { useCreatePatient, useUpdatePatient, usePatient, Patient, PatientDraft, PatientDuplicateCandidate, usePatientDuplicateCheck } from '@/ui/hooks/usePatients';
import { PatientSelector } from '@/ui/components/patients/PatientSelector';
import { PatientForm } from '@/ui/components/patients/PatientForm';
import { PatientDuplicateWarningDialog } from '@/ui/components/patients/PatientDuplicateWarningDialog';
import {
    Search, UserPlus, Clock, FileText, X, Save, Activity, ChevronRight
} from 'lucide-react';
import { useSheetStack } from '@/ui/components/ui/sheet-stack';
import { ClinicalDataContent } from '@/ui/components/secretary/patient/ClinicalDataSheet';
import { SecretaryDocumentsContent } from '@/ui/components/secretary/sheet/SecretaryDocumentsSheet';
import { useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/components/ui/select';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';

// Reusing components from calendar as requested for consistency
import { CompactPatientCard } from '@/ui/components/secretary/calendar/components/CompactPatientCard';
import { CompactDilationControl } from '@/ui/components/secretary/calendar/components/CompactDilationControl';
import { CompactAntecedentsSection } from '@/ui/components/secretary/calendar/components/CompactAntecedentsSection';
import { useConfig } from '@/ui/contexts/ConfigContext';
import { cn } from '@/ui/lib/utils';
import { PatientDebtSummary } from '@/ui/components/shared/billing/PatientDebtSummary';
import { PaymentHistorySheet } from '@/ui/components/doctor/history/PaymentHistorySheet';

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
    const duplicateCheck = usePatientDuplicateCheck();
    const updatePatient = useUpdatePatient();
    const { openSheet, closeSheet, sheets } = useSheetStack();

    // Refs for dirty checking active sheets
    const clinicalDirtyRef = useRef<(() => Promise<boolean>) | null>(null);
    const activeSheetRef = useRef<'clinical' | 'documents' | null>(null);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
    const [view, setView] = useState<'selection' | 'form' | 'entry' | 'edit-patient'>('selection');
    const [pendingPatientDraft, setPendingPatientDraft] = useState<PatientDraft | null>(null);
    const [duplicateCandidates, setDuplicateCandidates] = useState<PatientDuplicateCandidate[]>([]);
    const { appMode } = useConfig();

    const handleOpenClinicalData = async () => {
        if (!selectedPatient) return;

        // Clean up documents if open
        if (activeSheetRef.current === 'documents') {
            closeSheet('documents');
        } else if (activeSheetRef.current === 'clinical') {
            return; // Already open
        }

        activeSheetRef.current = 'clinical';
        openSheet(
            <ClinicalDataContent
                patientId={selectedPatient.id}
                patientName={`${selectedPatient.surname}   ${selectedPatient.name}`}
                onCancel={() => {
                    closeSheet('clinical-data');
                    activeSheetRef.current = null;
                }}
                onSuccess={() => {
                    closeSheet('clinical-data');
                    activeSheetRef.current = null;
                }}
                checkDirtyRef={clinicalDirtyRef}
            />,
            { id: 'clinical-data', width: 500, title: 'Données Cliniques', onDismiss: () => { activeSheetRef.current = null; } }
        );
    };

    const handleOpenDocuments = async () => {
        if (!selectedPatient) return;

        // Check if clinical is dirty before switching
        if (activeSheetRef.current === 'clinical') {
            if (clinicalDirtyRef.current) {
                const canClose = await clinicalDirtyRef.current();
                if (!canClose) return; // User cancelled
            }
            closeSheet('clinical-data');
        } else if (activeSheetRef.current === 'documents') {
            return;
        }

        activeSheetRef.current = 'documents';
        openSheet(
            <SecretaryDocumentsContent
                patientId={selectedPatient.id}
                patientName={`${selectedPatient.surname}   ${selectedPatient.name}`}
                patient={selectedPatient}
                onClose={() => {
                    closeSheet('documents');
                    activeSheetRef.current = null;
                }}
            />,
            { id: 'documents', width: 500, title: 'Documents', onDismiss: () => { activeSheetRef.current = null; } }
        );
    };
    const { data: consultationTypes = [] } = useConsultationTypes();

    const standardConsultationId = useMemo(() => {
        const standard = consultationTypes.find(t => 
            t.label.toLowerCase() === 'consultation standard' || 
            t.label.toLowerCase() === 'consulatation standard'
        ) || consultationTypes[0];
        return standard ? standard.id.toString() : '1';
    }, [consultationTypes]);

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<WaitlistEntryFormValues>({
        resolver: zodResolver(waitlistEntrySchema),
        defaultValues: {
            notes: '',
            needs_dilation: false,
            dilation_medicine: 'Mydriaticum',

            oph_ants: '',
            gen_ants: '',
            consultation_type_id: standardConsultationId
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
                consultation_type_id: standardConsultationId
            });
        }
    }, [isOpen, reset, standardConsultationId]);

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

    const finalizePatientCreate = useCallback(async (data: PatientDraft) => {
        try {
            const newPatient = await createPatient.mutateAsync(data);
            setSelectedPatient(newPatient);
            setView('entry');
            setPendingPatientDraft(null);
            setDuplicateCandidates([]);
        } catch (error) {
            console.error("Failed to create patient", error);
        }
    }, [createPatient]);

    const handlePatientCreate = useCallback(async (data: PatientDraft) => {
        try {
            const duplicates = await duplicateCheck.mutateAsync(data);
            if (duplicates.length > 0) {
                setPendingPatientDraft(data);
                setDuplicateCandidates(duplicates);
                return;
            }

            await finalizePatientCreate(data);
        } catch (error) {
            console.error("Failed to check patient duplicates", error);
        }
    }, [duplicateCheck, finalizePatientCreate]);

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
        <Sheet open={isOpen} onOpenChange={(open) => {
            if (!open) {
                if (sheets.length > 0) return;
                onClose();
            }
        }}>
            <SheetContent 
                side="right" 
                className="w-full sm:max-w-[480px] overflow-hidden p-0 flex flex-col"
                onInteractOutside={(e) => {
                    if (sheets.length > 0) e.preventDefault();
                }}
            >
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
                                isLoading={createPatient.isPending || duplicateCheck.isPending}
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

                            <PatientDebtSummary patientId={selectedPatient.id} variant="prominent" />

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between border-slate-200 bg-slate-50 hover:bg-slate-100"
                                onClick={() => setIsPaymentHistoryOpen(true)}
                            >
                                <span>Historique des paiements</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>

                            {/* Quick Actions Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-auto flex-col gap-1 py-1.5 border-dashed border-teal-200 bg-teal-50/30 hover:bg-teal-50 text-teal-700"
                                    onClick={handleOpenClinicalData}
                                >
                                    <Activity className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">Données Cliniques</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-auto flex-col gap-1 py-1.5 border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
                                    onClick={handleOpenDocuments}
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-[10px] font-medium">Documents</span>
                                </Button>
                            </div>

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

                <PatientDuplicateWarningDialog
                    open={duplicateCandidates.length > 0}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDuplicateCandidates([]);
                            setPendingPatientDraft(null);
                        }
                    }}
                    candidates={duplicateCandidates}
                    isCreating={createPatient.isPending}
                    onUseExisting={(patient) => {
                        setSelectedPatient(patient);
                        setDuplicateCandidates([]);
                        setPendingPatientDraft(null);
                        setView('entry');
                    }}
                    onCreateAnyway={() => {
                        if (!pendingPatientDraft) return;
                        void finalizePatientCreate(pendingPatientDraft);
                    }}
                />

                <PaymentHistorySheet
                    isOpen={isPaymentHistoryOpen}
                    onOpenChange={setIsPaymentHistoryOpen}
                    patientId={selectedPatient?.id || ''}
                />
            </SheetContent>
        </Sheet>
    );
}
