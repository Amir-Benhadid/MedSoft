/**
 * Appointment Data Hooks
 * 
 * Provides TanStack Query hooks for appointment-related operations including
 * listing appointments by date range, CRUD operations, and appointment state management
 * (marking present, managing dilation, etc.).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient as orpc } from '@/ui/lib/orpc/client';

/**
 * Appointment data interface
 */
export interface Appointment {
    id: string;
    patient_id: string;
    start_time: string;
    end_time: string;
    arrived_at?: string | null;
    title?: string;
    state: 'booked' | 'present' | 'in_consultation' | 'in_rehabilitation' | 'completed' | 'paid' | 'creance';
    type?: string;
    notes?: string;
    needs_dilation: boolean;
    dilation_status?: string | null;
    dilation_eye?: string | null;
    created_at?: string;
    updated_at?: string;
    consultation_type_id?: number;
    patient?: {
        name: string;
        surname: string;
        dob: string;
        phone: string;
        address: {
            street: string;
            city: string;
        };
    } | null;
}

/**
 * Input type for creating a new appointment
 * Excludes auto-generated fields and optional fields that are set by the system
 */
export type CreateAppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'arrived_at' | 'dilation_status'>;

/**
 * Hook to fetch appointments within a date range
 * 
 * @param {string} start - Start date/time in ISO format
 * @param {string} end - End date/time in ISO format
 * @returns {UseQueryResult<Appointment[]>} Query result containing appointments in the range
 */
export function useAppointments(start: string, end: string) {
    return useQuery({
        queryKey: ['appointments', start, end],
        queryFn: async () => {
            return await orpc.appointments.list({ start, end });
        },
    });
}

/**
 * Hook to create a new appointment
 * 
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with create function
 */
export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointment: CreateAppointmentInput) => {
            return await orpc.appointments.create(appointment);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

/**
 * Hook to update an existing appointment
 * 
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with update function
 */
export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Appointment> }) => {
            return await orpc.appointments.update({ id, updates });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

/**
 * Hook to delete an appointment
 * 
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with delete function
 */
export function useDeleteAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await orpc.appointments.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

/**
 * Hook to mark an appointment as present
 * 
 * Records the arrival time and updates the appointment state to 'present'.
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with markPresent function
 */
export function useMarkPresent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, arrivedAt }: { id: string; arrivedAt: string }) => {
            return await orpc.appointments.markPresent({ id, arrivedAt });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

/**
 * Hook to toggle dilation requirement for an appointment
 * 
 * Updates whether an appointment requires dilation and optionally sets the dilation type.
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with toggleDilation function
 */
export function useToggleDilation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, needsDilation, dilationType, eye }: { id: string; needsDilation: boolean; dilationType?: string; eye?: string }) => {
            return await orpc.appointments.toggleDilation({ id, needsDilation, dilationType, eye });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

/**
 * Hook to mark dilation as finished for an appointment
 * 
 * Updates the dilation status to indicate that dilation is complete.
 * Automatically invalidates the appointments queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with finishDilation function
 */
export function useFinishDilation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await orpc.appointments.finishDilation({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}
