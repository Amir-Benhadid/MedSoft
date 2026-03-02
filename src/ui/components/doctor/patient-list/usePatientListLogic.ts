import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';
import { useWaitlist } from '@/ui/hooks/useWaitlist';
import { format } from 'date-fns';
import { UnifiedPatientItem } from './types';

export function usePatientListLogic() {
    const [selectedDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'present' | 'waiting' | 'consultation'>('present');

    // 1. Fetch Waitlist
    const { data: waitlist, isLoading: isWaitlistLoading } = useWaitlist(format(selectedDate, 'yyyy-MM-dd'));

    // 2. Fetch Appointments
    const { data: appointments, isLoading: isAppointmentsLoading } = useQuery({
        queryKey: ['appointments', 'list', format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => orpcClient.appointments.list({
            start: `${format(selectedDate, 'yyyy-MM-dd')}T00:00:00`,
            end: `${format(selectedDate, 'yyyy-MM-dd')}T23:59:59`,
        }),
        refetchInterval: 5000,
    });

    // 3. Fetch Stats
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['todayStats'],
        queryFn: () => orpcClient.stats.getTodayStats(),
        refetchInterval: 10000,
    });

    // 3. Merge & Process Data
    const unifiedList = useMemo(() => {
        const list: UnifiedPatientItem[] = [];
        const seenPatientIds = new Set<string>();

        // Prioritize Waitlist (Present / In Progress / Completed)
        if (waitlist) {
            waitlist.forEach(entry => {
                list.push({
                    patientId: entry.patient_id,
                    patient: {
                        name: entry.patient_name || '',
                        surname: entry.patient_surname || '',
                    },
                    status: entry.state as any,
                    time: new Date(entry.arrived_at),
                    source: 'waitlist',
                    waitlistId: entry.id,
                    notes: entry.notes,
                    needsDilation: entry.needs_dilation,
                    dilationStatus: entry.dilation_type || undefined,
                    consultationTypeId: entry.consultation_type_id,
                    arrivalTime: new Date(entry.arrived_at),
                });
                seenPatientIds.add(entry.patient_id);
            });
        }

        // Add Appointments (Booked) if not already in waitlist
        if (appointments) {
            appointments.forEach(appt => {
                if (!seenPatientIds.has(appt.patient_id)) {
                    list.push({
                        patientId: appt.patient_id,
                        patient: appt.patient,
                        status: appt.state === 'present' ? 'waiting' : (appt.state === 'booked' ? 'booked' : (appt.state as any)),
                        time: new Date(appt.start_time),
                        source: 'appointment',
                        appointmentId: appt.id,
                        notes: appt.notes,
                        needsDilation: appt.needs_dilation,
                        consultationTypeId: appt.consultation_type_id,
                    });
                }
            });
        }

        // Sort: In Consultation > Waiting > Booked > Completed
        return list.sort((a, b) => {
            const score = (status: string) => {
                if (status === 'in_consultation') return 0;
                if (status === 'waiting') return 1;
                if (status === 'booked') return 2;
                return 3;
            };
            const scoreDiff = score(a.status) - score(b.status);
            if (scoreDiff !== 0) return scoreDiff;
            return a.time.getTime() - b.time.getTime();
        });
    }, [waitlist, appointments]);

    // 4. Filtering
    const filteredList = unifiedList.filter(item => {
        const fullName = `${item.patient?.name || ''} ${item.patient?.surname || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase());

        let matchesFilter = true;

        // "Présents" (Default) - Includes physically present (Waiting + In Consultation)
        if (activeFilter === 'present') {
            matchesFilter = ['waiting', 'in_consultation'].includes(item.status);
        }

        // "Prévus" (All) - Everything today
        if (activeFilter === 'all') {
            matchesFilter = !['cancelled'].includes(item.status);
        }

        // "En Attente" - Strictly waiting
        if (activeFilter === 'waiting') {
            matchesFilter = item.status === 'waiting';
        }

        // "En Cours" - Strictly in consultation
        if (activeFilter === 'consultation') {
            matchesFilter = item.status === 'in_consultation';
        }

        return matchesSearch && matchesFilter;
    });

    return {
        filteredList,
        unifiedList,
        stats,
        isStatsLoading,
        isWaitlistLoading,
        isAppointmentsLoading,
        searchTerm,
        setSearchTerm,
        activeFilter,
        setActiveFilter,
    };
}
