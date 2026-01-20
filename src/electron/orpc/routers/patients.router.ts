/**
 * Patients Router
 * 
 * Provides ORPC endpoints for managing patient records, including CRUD operations
 * and patient search functionality.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { PatientRepository } from '../../db/repositories/patient.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const patientSchema = z.object({
    id: z.string(),
    name: z.string(),
    surname: z.string(),
    dob: z.string().nullable().optional(),
    phone_number: z.string().nullable().optional(),
    street: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    oph_ants: z.string().nullable().optional(),
    gen_ants: z.string().nullable().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

const createPatientSchema = patientSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});

export const patientsRouter = os.router({
    /**
     * Lists all patients, ordered by surname and name.
     *
     * @returns Array of all patients
     */
    list: os
        .handler(async () => {
            const repo = new PatientRepository();
            return repo.findAll();
        }),

    /**
     * Searches patients by name, surname, or phone number.
     *
     * @param input.term - Search term
     * @returns Array of matching patients
     */
    search: os
        .input(z.object({ term: z.string() }))
        .handler(async ({ input }) => {
            const repo = new PatientRepository();
            return repo.search(input.term);
        }),

    /**
     * Creates a new patient record.
     *
     * @param input - Patient data without id and timestamps
     * @returns Created patient
     */
    create: os
        .input(createPatientSchema)
        .handler(async ({ input }) => {
            const repo = new PatientRepository();
            const result = repo.create(input);
            broadcastChange('patients');
            return result;
        }),

    /**
     * Updates an existing patient record.
     *
     * @param input.id - Patient ID
     * @param input.updates - Partial patient data to update
     * @returns Updated patient
     * @throws Error if patient not found
     */
    update: os
        .input(
            z.object({
                id: z.string(),
                updates: patientSchema.partial().omit({ id: true, created_at: true }),
            })
        )
        .handler(async ({ input }) => {
            const repo = new PatientRepository();
            const result = repo.update(input.id, input.updates);
            if (!result) {
                throw new Error('Patient not found');
            }
            broadcastChange('patients');
            return result;
        }),

    /**
     * Gets a patient by ID.
     *
     * @param input.id - Patient ID
     * @returns Patient record
     * @throws Error if patient not found
     */
    get: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new PatientRepository();
            const patient = repo.findById(input.id);
            if (!patient) {
                throw new Error('Patient not found');
            }
            return patient;
        }),

    /**
     * Deletes a patient record.
     *
     * @param input.id - Patient ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new PatientRepository();
            const success = repo.delete(input.id);
            broadcastChange('patients');
            return { success };
        }),
});
