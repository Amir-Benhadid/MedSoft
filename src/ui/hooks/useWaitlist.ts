/**
 * Waitlist Data Hooks
 * 
 * Provides TanStack Query hooks for waitlist operations including
 * listing entries by date, adding, removing, updating status, and
 * managing dilation for waitlist entries.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient as orpc } from '@/ui/lib/orpc/client';

/**
 * Waitlist entry data interface
 */
export interface WaitlistEntry {
    id: string;
    patient_id: string;
    state: 'waiting' | 'in_consultation' | 'in_rehabilitation' | 'completed' | 'paid' | 'creance';
    arrived_at: string;
    needs_dilation: boolean;
    dilation_type?: string | null;
    dilation_start_time?: string;
    patient_name?: string;
    patient_surname?: string;
    notes?: string;
}

/**
 * Input type for creating a new waitlist entry
 */
export type CreateWaitlistEntryInput = {
    patient_id: string;
    needs_dilation: boolean;
    dilation_medicine?: string;
    notes?: string;
    arrived_at?: string;
    consultation_type_id?: number;
};

import { getDayRangeEncoded, getLocalISOString } from '@/ui/lib/time';

/**
 * Hook to fetch waitlist entries for a specific date
 * 
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {UseQueryResult<WaitlistEntry[]>} Query result containing waitlist entries for the date
 */
export function useWaitlist(date: string) {
    return useQuery({
        queryKey: ['waitlist', date],
        queryFn: async () => {
            const range = getDayRangeEncoded(date);
            return await orpc.waitlist.list(range);
        },
    });
}

/**
 * Hook to add a new waitlist entry
 * 
 * Automatically sets the arrival time to current time if not provided.
 * Automatically invalidates the waitlist queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with create function
 */
export function useCreateWaitlistEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (entry: CreateWaitlistEntryInput) => {
            return await orpc.waitlist.add({
                ...entry,
                dilation_type: entry.dilation_medicine,
                state: 'waiting',
                arrived_at: entry.arrived_at || getLocalISOString(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
    });
}

/**
 * Hook to remove a waitlist entry
 * 
 * Automatically invalidates the waitlist queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with remove function
 */
export function useRemoveWaitlistEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await orpc.waitlist.remove({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
    });
}

/**
 * Hook to update the status of a waitlist entry
 * 
 * Used to transition entries between states (waiting, in_consultation, completed, etc.).
 * Automatically invalidates the waitlist queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with updateStatus function
 */
export function useUpdateWaitlistStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, state }: { id: string; state: string }) => {
            return await orpc.waitlist.updateStatus({ id, state });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
    });
}

/**
 * Hook to toggle dilation requirement for a waitlist entry
 * 
 * Updates whether a waitlist entry requires dilation and optionally sets the dilation type.
 * Automatically invalidates the waitlist queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with toggleDilation function
 */
export function useWaitlistToggleDilation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, needsDilation, dilationType }: { id: string; needsDilation: boolean; dilationType?: string }) => {
            return await orpc.waitlist.toggleDilation({ id, needsDilation, dilationMedicine: dilationType });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
    });
}

/**
 * Hook to mark dilation as finished for a waitlist entry
 * 
 * Updates the dilation status to indicate that dilation is complete.
 * Automatically invalidates the waitlist queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with finishDilation function
 */
export function useWaitlistFinishDilation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            return await orpc.waitlist.finishDilation({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        },
    });
}
