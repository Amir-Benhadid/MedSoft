import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useToast } from "@/ui/hooks/use-toast";
import { useConsultationStore } from '@/ui/store/consultationStore';
import { useConsultationTypes } from '@/ui/hooks/useConsultationTypes';
import { getLocalTodayDate, getDayRangeEncoded, getLocalISOString } from '@/ui/lib/time';
import { useNavigate } from '@tanstack/react-router';

interface UseDoctorDashboardLogicProps {
    patientId: string;
    consultationId?: string; // Add consultationId support
    onBack?: () => void;
    mode?: 'normal' | 'radiography';
}

export function useDoctorDashboardLogic({ patientId, consultationId, onBack, mode = 'normal' }: UseDoctorDashboardLogicProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate({ from: '/doctor' });

    // Store actions
    const setPatientId = useConsultationStore(state => state.setPatientId);
    const setPatient = useConsultationStore(state => state.setPatient);
    const reset = useConsultationStore(state => state.reset);
    const loadConsultation = useConsultationStore(state => state.loadConsultation);

    // Current ID tracking from store
    const loadedConsultationId = useConsultationStore(state => state.consultationId);

    const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(consultationId || null);
    const { data: consultationTypes = [] } = useConsultationTypes();
    const [isFinishSheetOpen, setIsFinishSheetOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Fetch Patient Details
    const { data: patient, isLoading: isPatientLoading } = useQuery({
        queryKey: ['patients', 'get', patientId],
        queryFn: () => orpcClient.patients.get({ id: patientId }),
        enabled: !!patientId
    });

    // Initialize Store
    useEffect(() => {
        setPatientId(patientId);
        if (patient) setPatient(patient);
    }, [patientId, patient, setPatientId, setPatient]);

    // Cleanup on unmount
    useEffect(() => {
        return () => reset();
    }, [reset]);

    // 1. Auto-Fetch Logic (Query + Store Sync)
    const { data: consultationData, isLoading: isConsultationLoading } = useQuery({
        queryKey: ['consultations', 'pending', patientId, mode, consultationId], // Depend on consultationId
        queryFn: async () => {
            // Logic 0: If specific ID requested, fetch that
            if (consultationId) {
                const all = await orpcClient.consultations.listByPatient({ patientId });
                const found = all.find(c => c.id === consultationId);
                if (found) return found;
            }

            const consultations = await orpcClient.consultations.listByPatient({ patientId });
            const today = getLocalTodayDate();
            const { start, end } = getDayRangeEncoded(today);
            
            // Logic 1: Find existing today's consultation
            // Check specifically for the current mode first if provided
            if (mode) {
                const targetType = mode === 'radiography' ? 'Radiography' : 'Consultation';
                const specificToday = consultations.find(c =>
                    c.date >= start &&
                    c.date <= end &&
                    (c.type === targetType || (!c.type && targetType === 'Consultation'))
                );
                if (specificToday) return specificToday;
            }

            // Logic 1.5: If NO match for targetType or mode not provided, check if ANY consultation exists today
            const anyToday = consultations.find(c => c.date >= start && c.date <= end);
            if (anyToday) return anyToday;

            // Logic 2: Determine type from today's waitlist/appointments before creating new
            // This is CRITICAL for search results or mode-less landings
            let detectedType = mode === 'radiography' ? 'Radiography' : 'Consultation';
            
            try {
                // Check waitlist for this patient today
                const waitlist = await orpcClient.waitlist.list({ start, end });
                const entry = waitlist.find(w => w.patient_id === patientId);
                if (entry?.consultation_type_id) {
                    const types = await orpcClient.consultationTypes.list();
                    const cType = types.find(t => t.id === entry.consultation_type_id);
                    if (cType?.nature === 'radiography') {
                        detectedType = 'Radiography';
                    } else if (cType?.nature === 'normal') {
                        detectedType = 'Consultation';
                    }
                } else {
                    // Check appointments if not in waitlist
                    const appointments = await orpcClient.appointments.list({ start, end });
                    const appt = appointments.find(a => a.patient_id === patientId);
                    if (appt?.consultation_type_id) {
                        const types = await orpcClient.consultationTypes.list();
                        const cType = types.find(t => t.id === appt.consultation_type_id);
                        if (cType?.nature === 'radiography') {
                            detectedType = 'Radiography';
                        } else if (cType?.nature === 'normal') {
                            detectedType = 'Consultation';
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to detect consultation type from scheduling:", e);
            }

            // Logic 3: Create NEW consultation with DETECTED type
            return await orpcClient.consultations.create({
                patient_id: patientId,
                date: getLocalISOString(),
                type: detectedType,
                status: 'pending',
            });
        },
        enabled: !!patientId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        gcTime: 30 * 60 * 1000,
    });

    // 1.1 Auto-Mode Sync: If fetched consultation type doesn't match current mode, redirect
    useEffect(() => {
        if (consultationData && !consultationId) {
            const detectedMode = consultationData.type === 'Radiography' ? 'radiography' : 'normal';
            // Only redirect if explicitly different or if mode was undefined
            if (detectedMode !== mode) {
                console.log(`🔄 Mode mismatch detected: URL Mode="${mode}", Detected Mode="${detectedMode}" (from consultation type "${consultationData.type}")`);
                console.log(`🚀 Redirecting to correct mode...`);
                navigate({
                    search: (prev: any) => ({
                        ...prev,
                        mode: detectedMode
                    }),
                    replace: true
                });
            }
        }
    }, [consultationData, mode, consultationId, navigate]);

    // 2. Fetch History (All Consultations)
    const { data: history = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['consultations', patientId],
        queryFn: async () => await orpcClient.consultations.listByPatient({ patientId }),
        enabled: !!patientId
    });

    // Auto-open History if patient has history (only once per patient load)
    const [hasInitializedHistory, setHasInitializedHistory] = useState(false);

    // Reset initialization when patient changes
    useEffect(() => {
        setHasInitializedHistory(false);
        setIsHistoryOpen(false);
    }, [patientId]);

    useEffect(() => {
        if (!isHistoryLoading && !hasInitializedHistory) {
            if (history.length > 0) {
                setIsHistoryOpen(true);
            }
            setHasInitializedHistory(true);
        }
    }, [isHistoryLoading, history, hasInitializedHistory]);

    // Determine current ID and Safe Sync
    useEffect(() => {
        // Init with fetched data
        if (!currentConsultationId && consultationData) {
            setCurrentConsultationId(consultationData.id);
        }

        // Initial Store Load (only once when we find our target consultation)
        // Or if the consultationId matches (explicit switch)
        if (consultationData && (consultationData.id === currentConsultationId || consultationData.id === consultationId) && consultationData.id !== loadedConsultationId) {
            console.log("Loading fresh consultation data into store", consultationData.id);

            // Find previous consultation to carry over fields for new consultations
            let previousConsultation: any = null;
            if (history && history.length > 0) {
                // history is usually sorted by date desc. Find the most recent one that is not the current one
                previousConsultation = history.find(c => c.id !== consultationData.id);
            }

            // If the consultation history is empty but patient has history, pre-fill it in the store
            const mergedConsultation = {
                ...consultationData,
                left_eye: {
                    ...(consultationData.left_eye || {}),
                    pachymetry: consultationData.left_eye?.pachymetry || previousConsultation?.left_eye?.pachymetry || '',
                },
                right_eye: {
                    ...(consultationData.right_eye || {}),
                    pachymetry: consultationData.right_eye?.pachymetry || previousConsultation?.right_eye?.pachymetry || '',
                },
                clinical_exam: {
                    ...consultationData.clinical_exam,
                    generalMedicalHistory: consultationData.clinical_exam?.generalMedicalHistory || previousConsultation?.clinical_exam?.generalMedicalHistory || patient?.gen_ants || '',
                    ophthalmologicalHistory: consultationData.clinical_exam?.ophthalmologicalHistory || previousConsultation?.clinical_exam?.ophthalmologicalHistory || patient?.oph_ants || '',
                    profile: consultationData.clinical_exam?.profile || previousConsultation?.clinical_exam?.profile || '',
                }
            };

            loadConsultation(mergedConsultation);
            // Also sync state ID if differ
            if (currentConsultationId !== consultationData.id) setCurrentConsultationId(consultationData.id);
        }
    }, [consultationData, currentConsultationId, loadConsultation, loadedConsultationId, patient, consultationId, history]);

    // F3 Shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F3') {
                e.preventDefault();
                setIsHistoryOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 3. Finalize/Save Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ paymentData, finish }: { paymentData?: any, finish: boolean }) => {
            if (!currentConsultationId) throw new Error("No active consultation");

            // Get standard state
            const state = useConsultationStore.getState();

            // Payload
            const payload: any = {
                left_eye: state.leftEye,
                right_eye: state.rightEye,
                clinical_exam: {
                    ...state.clinicalExam,
                    dilatationRequired: state.dilatationRequired,
                    // Merge nextAppointment if provided in paymentData (from Finish Sheet)
                    ...((finish && paymentData?.nextAppointment) ? { nextAppointment: paymentData.nextAppointment } : {})
                },
                prescription: { treatments: state.prescriptions },
                documents_data: state.documentOverrides as any,
                // Only mark completed if finish is true
                status: finish ? 'completed' : 'pending',

                payment: (finish && paymentData) ? {
                    amount: paymentData.amount,
                    type: paymentData.status,
                    method: 'cash',
                    consultation_type_id: paymentData.consultationType,
                } : undefined
            };

            return await orpcClient.consultations.update({
                id: currentConsultationId,
                updates: payload
            });
        },
        onSuccess: (_, variables) => {
            const title = variables.finish ? "Consultation terminée." : "Sauvegardée.";
            toast({ title: "Succès", description: title });
            queryClient.invalidateQueries({ queryKey: ['consultations', patientId] });
            queryClient.invalidateQueries({ queryKey: ['consultations', 'pending', patientId] });
            queryClient.invalidateQueries({ queryKey: ['consultations', 'last-completed', patientId] }); // For radiography dashboard real-time updates
            queryClient.invalidateQueries({ queryKey: ['patients', 'get', patientId] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
            queryClient.invalidateQueries({ queryKey: ['resume'] });
            if (variables.finish && onBack) onBack();
        },
        onError: (err) => {
            toast({ title: "Erreur", description: "Erreur lors de la sauvegarde.", variant: "destructive" });
            console.error(err);
        }
    });

    // Helper: Is active consultation Today?
    const activeConsultation = (history.find(c => c.id === currentConsultationId) || consultationData) as any;

    // Check if active consultation date is within Local Today range
    const isActiveConsultationToday = (() => {
        if (!activeConsultation?.date) return false; // Safety: default false if not loaded
        const today = getLocalTodayDate();
        const { start, end } = getDayRangeEncoded(today);
        return activeConsultation.date >= start && activeConsultation.date <= end;
    })();

    // Context Switching Logic
    const handleSwitchConsultation = async (newConsultation: any) => {
        if (!currentConsultationId || currentConsultationId === newConsultation.id) return;

        // 1. Auto-save current ONLY if it was "Today's" consultation
        // The user explicitly requested: "When we switch from current consultation to another... we save."
        // "But if we change from another ... it should not automatically save."
        if (isActiveConsultationToday) {
            try {
                await saveMutation.mutateAsync({ finish: false });
            } catch (e) {
                console.error("Failed to auto-save before switch", e);
            }
        }

        // 2. Check Mode Compatability
        const newMode = (newConsultation.type === 'Radiography') ? 'radiography' : 'normal';

        // If mode is different, we MUST navigate. The Dashboard layout depends on URL mode.
        if (newMode !== mode) {
            navigate({
                search: (prev: any) => ({
                    ...prev,
                    mode: newMode,
                    consultationId: newConsultation.id
                })
            });
            // The nav will unmount us and remount. Store will reset.
            // On remount, `consultationId` in props will trigger simple fetch and load.
            return;
        }

        // If mode is same, we can just switch state locally OR navigate to update URL for consistency.
        // It's cleaner to navigate to keep URL in sync with state.
        navigate({
            search: (prev: any) => ({
                ...prev,
                consultationId: newConsultation.id
            })
        });

        // However, if we just navigate, we rely on the component re-rendering. 
        // We can ALSO load immediately for snappiness if valid.
        // But since we navigate, let's defer to the prop change reaction.
        setIsHistoryOpen(false);
    };

    return {
        patient,
        isPatientLoading,
        consultationData,
        isConsultationLoading,
        saveMutation,
        // UI State
        consultationTypes,
        isFinishSheetOpen,
        setIsFinishSheetOpen,
        currentConsultationId,
        // History Props
        isHistoryOpen,
        setIsHistoryOpen,
        history,
        handleSwitchConsultation,
        isActiveConsultationToday
    };
}
