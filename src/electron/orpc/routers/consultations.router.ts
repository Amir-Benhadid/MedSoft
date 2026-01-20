/**
 * Consultations Router
 * 
 * Provides ORPC endpoints for managing medical consultations, including
 * listing consultations by patient, creating new consultations, and updating
 * existing consultation data.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { ConsultationRepository } from '../../db/repositories/consultation.repository.js';
import { CreateConsultationSchema } from '../../db/schemas/consultation.schema.js';
import { broadcastChange } from '../../lib/broadcast.js';

export const consultationsRouter = os.router({
    /**
     * Lists all consultations for a specific patient.
     *
     * @param input.patientId - Patient ID
     * @returns Array of consultations for the patient
     */
    listByPatient: os
        .input(z.object({ patientId: z.string() }))
        .handler(async ({ input }) => {
            const repo = new ConsultationRepository();
            return repo.findAllByPatientId(input.patientId);
        }),

    /**
     * Gets a consultation by ID.
     *
     * @param input.id - Consultation ID
     * @returns Consultation record
     * @throws Error if consultation not found
     */
    get: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new ConsultationRepository();
            const consultation = repo.findById(input.id);
            if (!consultation) {
                throw new Error('Consultation not found');
            }
            return consultation;
        }),

    /**
     * Creates a new consultation with all related data.
     *
     * @param input - Consultation creation data
     * @returns Created consultation or null if patient doesn't exist
     */
    create: os
        .input(CreateConsultationSchema)
        .handler(async ({ input }) => {
            const repo = new ConsultationRepository();
            const result = repo.create(input);
            if (result) {
                broadcastChange('consultations');
            }
            return result;
        }),

    /**
     * Updates an existing consultation.
     *
     * @param input.id - Consultation ID
     * @param input.updates - Partial consultation data to update
     * @returns Success indicator
     */
    update: os
        .input(
            z.object({
                id: z.string(),
                updates: CreateConsultationSchema.partial(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new ConsultationRepository();
            const success = repo.update(input.id, input.updates);
            if (success) {
                broadcastChange('consultations');
            }
            return { success };
        }),
});
