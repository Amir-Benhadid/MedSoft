import { useEffect, useRef } from 'react';
import { useConsultationStore, runSyncDocuments } from '@/ui/store/consultationStore';

/**
 * Runs syncDocuments 400ms after the last change to eye or clinical exam data.
 * Must be mounted once inside DoctorDashboard — not inside tab children.
 */
export function useDocumentSync() {
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const prevRef = useRef<{ leftEye: any; rightEye: any; clinicalExam: any } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            const currentState = useConsultationStore.getState();
            const prev = prevRef.current;
            if (!prev) {
                prevRef.current = { leftEye: currentState.leftEye, rightEye: currentState.rightEye, clinicalExam: currentState.clinicalExam };
                return;
            }

            // Only run sync if something actually changed
            if (prev.leftEye !== currentState.leftEye || prev.rightEye !== currentState.rightEye || prev.clinicalExam !== currentState.clinicalExam) {
                runSyncDocuments();
                prevRef.current = { leftEye: currentState.leftEye, rightEye: currentState.rightEye, clinicalExam: currentState.clinicalExam };
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [leftEye, rightEye, clinicalExam]);
}
