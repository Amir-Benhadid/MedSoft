/**
 * Workflow-specific Hooks
 * 
 * Computes derived workflow state from appointments, waitlist, and patients.
 * These hooks aggregate data from multiple sources to provide workflow-specific
 * views like "who is in consultation", "who needs payment", etc.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orpcClient } from '@/ui/lib/orpc/client';

import { getLocalTodayDate, getDayRangeEncoded } from '@/ui/lib/time';

/**
 * Get today's date in YYYY-MM-DD format
 * Uses local time correctly
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayDate() {
    return getLocalTodayDate();
}

/**
 * Hook to get the patient currently in consultation
 * 
 * Checks both appointments and waitlist for entries with 'in_consultation' state.
 * Prioritizes appointments over waitlist entries. Returns patient data with
 * source information (appointmentId or waitlistId).
 * 
 * @returns {Object | null} Patient object with consultation source info, or null if none
 */
export function useInConsultation() {
    const today = useMemo(() => getTodayDate(), []);

    // Query today's appointments
    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.appointments.list(range);
        },
        // refetchInterval: 3000, // Relying on useRealtime
    });

    // Query today's waitlist
    const { data: waitlist = [] } = useQuery({
        queryKey: ['waitlist', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.waitlist.list(range);
        },
        // refetchInterval: 3000,
    });

    // Compute in consultation patient
    const inConsultation = useMemo(() => {
        // Check appointments first
        const inConsultationAppointment = appointments.find(
            (apt) => apt.state === 'in_consultation'
        );

        if (inConsultationAppointment) {
            // Prioritize embedded patient data if available
            if (inConsultationAppointment.patient) {
                return {
                    ...inConsultationAppointment.patient,
                    id: inConsultationAppointment.patient_id, // ensure ID is at top level
                    appointmentId: inConsultationAppointment.id,
                };
            }
        }

        // Check waitlist entries
        const inConsultationWaitlist = waitlist.find(
            (w) => w.state === 'in_consultation'
        );

        if (inConsultationWaitlist) {
            // Waitlist entries typically have patient_name, patient_surname flattened
            if (inConsultationWaitlist.patient_name) {
                return {
                    id: inConsultationWaitlist.patient_id,
                    name: inConsultationWaitlist.patient_name,
                    surname: inConsultationWaitlist.patient_surname,
                    waitlistId: inConsultationWaitlist.id,
                };
            }
        }

        return null;
    }, [appointments, waitlist]);

    return inConsultation;
}

/**
 * Hook to get patients pending payment
 * 
 * Checks both appointments and waitlist for entries with 'completed' state.
 * Returns a queue of patients who have completed consultation but haven't paid yet.
 * Deduplicates patients if they appear in both appointments and waitlist.
 * 
 * @returns {Array} Array of patient objects with payment source info (appointmentId or waitlistId)
 */
export function usePendingPayment() {
    const today = useMemo(() => getTodayDate(), []);

    // Query today's appointments
    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.appointments.list(range);
        },
        // refetchInterval: 5000,
    });

    // Query today's waitlist
    const { data: waitlist = [] } = useQuery({
        queryKey: ['waitlist', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.waitlist.list(range);
        },
        // refetchInterval: 5000,
    });

    // Query all patients
    const { data: patients = [] } = useQuery({
        queryKey: ['patients', 'list'],
        queryFn: async () => {
            return orpcClient.patients.list();
        },
    });

    // Compute pending payment patients (Queue)
    const pendingPayments = useMemo(() => {
        const queue: any[] = [];
        const seenPatientIds = new Set<string>();

        // Check appointments with 'completed' state
        appointments.forEach((apt) => {
            if (apt.state === 'completed') {
                const patient = patients.find((p) => p.id === apt.patient_id);
                if (patient && !seenPatientIds.has(patient.id)) {
                    queue.push({
                        ...patient,
                        appointmentId: apt.id,
                        source: 'appointment',
                        updatedAt: apt.updated_at
                    });
                    seenPatientIds.add(patient.id);
                }
            }
        });

        // Check waitlist entries with 'completed' state
        waitlist.forEach((w) => {
            if (w.state === 'completed') {
                const patient = patients.find((p) => p.id === w.patient_id);
                if (patient && !seenPatientIds.has(patient.id)) {
                    queue.push({
                        ...patient,
                        waitlistId: w.id,
                        source: 'waitlist',
                        updatedAt: w.updated_at
                    });
                    seenPatientIds.add(patient.id);
                }
            }
        });

        // Optional: Sort by update time to have FIFO queue?
        // For now, return list.
        return queue;
    }, [appointments, waitlist, patients]);

    return pendingPayments;
}

/**
 * Hook to get patients needing dilation
 * 
 * Checks both appointments and waitlist for entries with needs_dilation flag.
 * Excludes entries that are already paid or in creance state.
 * Returns patient data with dilation status and timing information.
 * 
 * @returns {Array} Array of patient objects with dilation information
 */
export function usePatientsNeedingDilation() {
    const today = useMemo(() => getTodayDate(), []);

    // Query today's appointments
    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.appointments.list(range);
        },
        // refetchInterval: 5000,
    });

    // Query today's waitlist
    const { data: waitlist = [] } = useQuery({
        queryKey: ['waitlist', today],
        queryFn: async () => {
            const range = getDayRangeEncoded(today);
            return orpcClient.waitlist.list(range);
        },
        // refetchInterval: 5000,
    });

    // Query all patients
    const { data: patients = [] } = useQuery({
        queryKey: ['patients', 'list'],
        queryFn: async () => {
            return orpcClient.patients.list();
        },
    });

    // Compute patients needing dilation
    const patientsNeedingDilation = useMemo(() => {
        const result: any[] = [];

        // Check appointments needing dilation
        appointments.forEach((apt) => {
            if (
                apt.needs_dilation &&
                apt.state !== 'paid' &&
                apt.state !== 'creance'
            ) {
                const patient = patients.find((p) => p.id === apt.patient_id);
                if (patient) {
                    result.push({
                        ...patient,
                        appointmentId: apt.id,
                        needs_dilation: apt.needs_dilation,
                        dilation_status: apt.dilation_status,
                        dilation_type: apt.dilation_type,
                        dilation_started_at: apt.dilation_started_at,
                    });
                }
            }
        });

        // Check waitlist entries needing dilation
        waitlist.forEach((w) => {
            if (
                w.needs_dilation &&
                w.state !== 'paid' &&
                w.state !== 'creance'
            ) {
                const patient = patients.find((p) => p.id === w.patient_id);
                if (patient) {
                    // Avoid duplicates
                    const alreadyAdded = result.some(
                        (p) => p.id === patient.id
                    );
                    if (!alreadyAdded) {
                        result.push({
                            ...patient,
                            waitlistId: w.id,
                            needs_dilation: w.needs_dilation,
                            dilation_status: w.dilation_status,
                            dilation_type: w.dilation_type,
                            dilation_started_at: w.dilation_started_at,
                        });
                    }
                }
            }
        });

        return result;
    }, [appointments, waitlist, patients]);

    return patientsNeedingDilation;
}
