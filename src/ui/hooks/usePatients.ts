/**
 * Patient Data Hooks
 * 
 * Provides TanStack Query hooks for patient-related operations including
 * listing, searching, fetching individual patients, and CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';

/**
 * Patient data interface
 */
export interface Patient {
    id: string;
    name: string;
    surname: string;
    dob?: string | null;
    phone_number?: string | null;
    street?: string | null;
    city?: string | null;
    oph_ants?: string | null;
    gen_ants?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface PatientDraft {
    name: string;
    surname: string;
    dob?: string | null;
    phone_number?: string | null;
    street?: string | null;
    city?: string | null;
    oph_ants?: string | null;
    gen_ants?: string | null;
}

export type DuplicateConfidence = 'high' | 'medium';

export interface PatientDuplicateCandidate extends Patient {
    confidence: DuplicateConfidence;
    reasons: string[];
}

export interface PatientSearchResult extends Patient {
    duplicate_count: number;
    duplicate_candidates: PatientDuplicateCandidate[];
}

/**
 * Hook to fetch all patients
 * 
 * @returns {UseQueryResult<Patient[]>} Query result containing the list of patients
 */
export function usePatients() {
    return useQuery({
        queryKey: ['patients', 'list'],
        queryFn: async () => {
            return orpcClient.patients.list();
        },
    });
}

/**
 * Hook to search patients by search term
 * 
 * Only executes the query when the search term has at least 2 characters.
 * 
 * @param {string} term - Search term to match against patient names
 * @returns {UseQueryResult<Patient[]>} Query result containing matching patients
 */
export function usePatientSearch(term: string) {
    return useQuery({
        queryKey: ['patients', 'search', term],
        queryFn: async () => {
            if (!term) return [];
            return orpcClient.patients.search({ term });
        },
        enabled: term.length >= 2,
    });
}

/**
 * Hook to fetch a single patient by ID
 * 
 * Only executes the query when a valid ID is provided.
 * 
 * @param {string | null} id - Patient ID to fetch
 * @returns {UseQueryResult<Patient | null>} Query result containing the patient or null
 */
export function usePatient(id: string | null) {
    return useQuery({
        queryKey: ['patients', 'get', id],
        queryFn: async () => {
            if (!id) return null;
            return orpcClient.patients.get({ id });
        },
        enabled: !!id,
    });
}

/**
 * Hook to create a new patient
 * 
 * Automatically invalidates the patients list query on success to refresh the data.
 * 
 * @returns {UseMutationResult} Mutation object with create function
 */
export function useCreatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (patient: PatientDraft) => {
            return orpcClient.patients.create(patient);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
}

/**
 * Hook to update an existing patient
 * 
 * Automatically invalidates the patients list and the specific patient query on success.
 * 
 * @returns {UseMutationResult} Mutation object with update function
 */
export function useUpdatePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Patient> }) => {
            return orpcClient.patients.update({ id, updates });
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patients', 'get', data.id] });
        },
    });
}

export function usePatientDuplicateCheck() {
    return useMutation({
        mutationFn: async (patient: PatientDraft) => {
            return orpcClient.patients.findPotentialDuplicates(patient);
        },
    });
}

export function useMergePatients() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: {
            survivor_id: string;
            duplicate_ids: string[];
            resolved_patient: Partial<PatientDraft>;
        }) => {
            return orpcClient.patients.merge(input);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['waitlist'] });
            queryClient.invalidateQueries({ queryKey: ['consultations'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['sharedRecords'] });
            queryClient.invalidateQueries({ queryKey: ['patients', 'get', data.id] });
        },
    });
}

/**
 * Hook to delete a patient
 * 
 * Automatically invalidates the patients list query on success to refresh the data.
 * 
 * @returns {UseMutationResult} Mutation object with delete function
 */
export function useDeletePatient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return orpcClient.patients.delete({ id });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
        },
    });
}
