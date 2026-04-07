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
    consultationId?: string;
    action?: 'view' | 'consultation';
    onBack?: () => void;
    mode?: 'normal' | 'radiography';
}

export function useDoctorDashboardLogic({ patientId, consultationId, action, onBack, mode = 'normal' }: UseDoctorDashboardLogicProps) {
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

    // 1. Fetch Today's or Selected Consultation
    // We use a query to find the correct consultation to display
    const { data: consultationData, isLoading: isConsultationLoading } = useQuery({
        queryKey: ['consultations', 'active', patientId, mode, consultationId, action],
        queryFn: async () => {
            console.log(`🔍 useDoctorDashboardLogic: Locating consultation (patientId: ${patientId}, consultationId: ${consultationId}, action: ${action})`);
            
            // Logic 0: If specific ID requested in URL, fetch that strictly
            if (consultationId) {
                const all = await orpcClient.consultations.listByPatient({ patientId });
                const found = all.find(c => c.id === consultationId);
                if (found) return found;
                console.warn("⚠️ Consultation ID in URL not found, falling back...");
            }

            const consultations = await orpcClient.consultations.listByPatient({ patientId });
            const today = getLocalTodayDate();
            const { start, end } = getDayRangeEncoded(today);

            // Logic 1: Find existing today's consultation (PRIORITY)
            // We search for ANY pending consultation for this patient today.
            // If we are in 'radiography' mode, we look for that type first, but fallback to standard if it's all we have.
            const targetType = mode === 'radiography' ? 'Radiography' : 'Consultation';
            
            // Search for EXACT match (type + pending)
            let specificToday = consultations.find(c => {
                const isWithinRange = (c.date >= start && c.date <= end) || c.date === today;
                const isCorrectType = (c.type === targetType || (!c.type && targetType === 'Consultation'));
                return isWithinRange && isCorrectType && c.status === 'pending';
            });

            // Fallback: Search for ANY pending match today regardless of type if we are in 'consultation' action
            if (!specificToday && action === 'consultation') {
                specificToday = consultations.find(c => {
                    const isWithinRange = (c.date >= start && c.date <= end) || c.date === today;
                    return isWithinRange && c.status === 'pending';
                });
            }

            if (specificToday) {
                console.log("✅ Found pending consultation for today:", specificToday.id);
                return specificToday;
            }

            // Logic 2: Auto-create if action is 'consultation' (triggered from patient list)
            if (action === 'consultation') {
                console.log("🚀 Auto-creating consultation record...");
                try {
                    const newConsultation = await orpcClient.consultations.create({
                        patient_id: patientId,
                        date: getLocalISOString(),
                        type: targetType,
                        status: 'pending',
                    });
                    
                    if (!newConsultation) {
                        console.error("❌ Failed to auto-create consultation (returned null)");
                        return null;
                    }

                    // Success: Invalidate relevant queries
                    queryClient.invalidateQueries({ queryKey: ['consultations', 'list', patientId] });
                    return newConsultation;
                } catch (err) {
                    console.error("❌ Critical error during auto-creation:", err);
                    return null;
                }
            }

            // Logic 3: Fallback to the MOST RECENT consultation in history (for 'view' mode)
            if (consultations.length > 0) {
                console.log("ℹ️ View mode fallback: Most recent history entry.");
                return consultations[0];
            }

            console.log("ℹ️ No consultation record found.");
            return null;
        },
        enabled: !!patientId,
        staleTime: 5000, // Reduced staleTime to ensure we don't work with old results during rapid clicks
        refetchOnWindowFocus: false,
    });

    // 2. Fetch History (All Consultations)
    const { data: history = [], isLoading: isHistoryLoading, refetch: refetchHistory } = useQuery({
        queryKey: ['consultations', 'list', patientId],
        queryFn: async () => await orpcClient.consultations.listByPatient({ patientId }),
        enabled: !!patientId
    });

    // 3. Create Mutation (Manual)
    const createConsultationMutation = useMutation({
        mutationFn: async () => {
            console.log("➕ Manual consultation creation requested...");
            let detectedType = mode === 'radiography' ? 'Radiography' : 'Consultation';
            const today = getLocalTodayDate();
            const { start, end } = getDayRangeEncoded(today);

            try {
                const waitlist = await orpcClient.waitlist.list({ start, end });
                const entry = waitlist.find(w => w.patient_id === patientId);
                if (entry?.consultation_type_id) {
                    const types = await orpcClient.consultationTypes.list();
                    const cType = types.find(t => t.id === entry.consultation_type_id);
                    if (cType?.nature === 'radiography') detectedType = 'Radiography';
                    else if (cType?.nature === 'normal') detectedType = 'Consultation';
                }
            } catch (e) {
                console.warn("Type detection failed (not critical)", e);
            }

            const result = await orpcClient.consultations.create({
                patient_id: patientId,
                date: getLocalISOString(),
                type: detectedType,
                status: 'pending',
            });

            if (!result) throw new Error("Erreur base de données lors de la création.");
            return result;
        },
        onSuccess: (newConsultation) => {
            console.log("✅ Consultation created successfully:", newConsultation.id);
            toast({ title: "Nouvelle consultation créée" });
            
            // Refetch active query to switch to the new one
            queryClient.invalidateQueries({ queryKey: ['consultations', 'active', patientId] });
            queryClient.invalidateQueries({ queryKey: ['consultations', 'list', patientId] });
            
            // Navigate to the new ID to update URL
            navigate({
                search: (prev: any) => ({
                    ...prev,
                    consultationId: newConsultation.id,
                    mode: newConsultation.type === 'Radiography' ? 'radiography' : 'normal',
                    action: 'consultation'
                }),
                replace: true
            });
            
            setIsHistoryOpen(false);
            setCurrentConsultationId(newConsultation.id);
        },
        onError: (err: any) => {
            console.error("❌ Failed to create consultation:", err);
            toast({ 
                title: "Erreur", 
                description: err.message || "Impossible de créer la consultation.", 
                variant: "destructive" 
            });
        }
    });

    // Auto-open History logic
    const [hasInitializedHistory, setHasInitializedHistory] = useState(false);
    useEffect(() => {
        setHasInitializedHistory(false);
    }, [patientId]);

    useEffect(() => {
        if (!isHistoryLoading && !hasInitializedHistory && history) {
            // Auto-open if history exists AND we are currently viewing the latest one (but it's not today's)
            // Or just always open if history exists for awareness
            if (history.length > 0) {
                setIsHistoryOpen(true);
            }
            setHasInitializedHistory(true);
        }
    }, [isHistoryLoading, history, hasInitializedHistory]);

    // 4. Synchronization and URL Locking
    useEffect(() => {
        // Init with fetched data
        if (!currentConsultationId && consultationData) {
            console.log("📍 Syncing currentConsultationId with fetched data:", consultationData.id);
            setCurrentConsultationId(consultationData.id);

            // CRITICAL: If we are viewing a consultation but the ID is not in the URL,
            // we must update the navigation state. This "locks" the session and 
            // prevents Logic 2 (Auto-create) from re-running on refetches.
            if (!consultationId) {
                console.log("🔗 Locking URL to consultation ID:", consultationData.id);
                navigate({
                    search: (prev: any) => ({
                        ...prev,
                        consultationId: consultationData.id,
                        action: 'consultation' // Ensure we stay in consultation mode
                    }),
                    replace: true // Use replace to not pollute browser history
                });
            }
        }

        // Initial Store Load
        // Load data if we have it and it's different from what's currently in the store
        if (consultationData && !isHistoryLoading && consultationData.id !== loadedConsultationId) {
            console.log("💾 Loading consultation data into store:", consultationData.id);
            console.log("   (Action:", action, ", PatientId:", patientId, ")");

            // Find previous consultation to carry over fields
            let previousConsultation: any = null;
            if (history && history.length > 0) {
                previousConsultation = history.find(c => c.id !== consultationData.id);
            }

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
                    ...(consultationData.clinical_exam || {}),
                    generalMedicalHistory: consultationData.clinical_exam?.generalMedicalHistory || previousConsultation?.clinical_exam?.generalMedicalHistory || patient?.gen_ants || '',
                    ophthalmologicalHistory: consultationData.clinical_exam?.ophthalmologicalHistory || previousConsultation?.clinical_exam?.ophthalmologicalHistory || patient?.oph_ants || '',
                    profile: consultationData.clinical_exam?.profile || previousConsultation?.clinical_exam?.profile || '',
                }
            };

            loadConsultation(mergedConsultation);
            if (currentConsultationId !== consultationData.id) setCurrentConsultationId(consultationData.id);
        }
    }, [consultationData, currentConsultationId, loadConsultation, loadedConsultationId, patient, consultationId, history, isHistoryLoading]);

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
            if (!currentConsultationId) {
                toast({ title: "Action impossible", description: "Veuillez d'abord créer une consultation pour ce patient.", variant: "destructive" });
                throw new Error("No active consultation");
            }

            console.log(`💾 Saving consultation ${currentConsultationId}${finish ? ' (Finalizing)' : ''}...`);

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
            queryClient.invalidateQueries({ queryKey: ['patients', 'get', patientId] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
            queryClient.invalidateQueries({ queryKey: ['resume'] });
            if (variables.finish && onBack) onBack();
        },
        onError: (err: any) => {
            toast({ title: "Erreur", description: err.message || "Erreur lors de la sauvegarde.", variant: "destructive" });
            console.error("❌ Save failed:", err);
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

    // Helper: Is ANY consultation for today (matched by type)?
    const hasTodayConsultation = (() => {
        const today = getLocalTodayDate();
        const { start, end } = getDayRangeEncoded(today);
        const targetType = mode === 'radiography' ? 'Radiography' : 'Consultation';
        
        return history.some(c => {
            const isToday = (c.date >= start && c.date <= end) || c.date === today;
            const isMatchingType = (c.type === targetType || (!c.type && targetType === 'Consultation'));
            return isToday && isMatchingType;
        });
    })();

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
        isActiveConsultationToday,
        hasTodayConsultation,
        createConsultationMutation
    };
}
