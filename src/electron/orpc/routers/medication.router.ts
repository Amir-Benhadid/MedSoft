/**
 * Medication Router
 * 
 * Provides ORPC endpoints for managing medication records, including listing,
 * searching, creating, updating, and deleting medications.
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { MedicationRepository, CreateMedicineSchema, MedicineSchema } from '../../db/repositories/medication.repository.js';

export const medicationRouter = os.router({
    /**
     * Lists medications with pagination support.
     *
     * @param input.limit - Maximum number of results (default: 50)
     * @param input.offset - Number of results to skip (default: 0)
     * @returns Array of medications
     */
    list: os
        .input(
            z.object({
                limit: z.number().default(50),
                offset: z.number().default(0),
            })
        )
        .output(z.array(MedicineSchema))
        .handler(async ({ input }) => {
            return MedicationRepository.findAll(input.limit, input.offset);
        }),

    /**
     * Searches medications by name.
     *
     * @param input.query - Search query string
     * @param input.limit - Maximum number of results (default: 50)
     * @param input.offset - Number of results to skip (default: 0)
     * @returns Array of matching medications
     */
    search: os
        .input(
            z.object({
                query: z.string(),
                limit: z.number().default(50),
                offset: z.number().default(0),
            })
        )
        .output(z.array(MedicineSchema))
        .handler(async ({ input }) => {
            return MedicationRepository.search(input.query, input.limit, input.offset);
        }),

    /**
     * Creates a new medication record.
     *
     * @param input - Medication data
     * @returns Created medication
     */
    create: os
        .input(CreateMedicineSchema)
        .output(MedicineSchema.optional())
        .handler(async ({ input }) => {
            return MedicationRepository.create(input);
        }),

    /**
     * Updates a medication record.
     *
     * @param input.id - Medication ID
     * @param input.data - Partial medication data to update
     * @returns Updated medication
     */
    update: os
        .input(
            z.object({
                id: z.string(),
                data: CreateMedicineSchema.partial(),
            })
        )
        .output(MedicineSchema.optional())
        .handler(async ({ input }) => {
            return MedicationRepository.update(input.id, input.data);
        }),

    /**
     * Deletes a medication record.
     *
     * @param input.id - Medication ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .handler(async ({ input }) => {
            return MedicationRepository.delete(input.id);
        })
});
