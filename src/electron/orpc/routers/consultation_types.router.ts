/**
 * Consultation Types Router
 * 
 * Provides ORPC endpoints for managing consultation types, including listing,
 * creating, updating, and deleting types with their pricing and configuration.
 */

import { os } from '@orpc/server';
import { ConsultationTypeRepository } from '../../db/repositories/consultation_type.repository.js';
import { z } from 'zod';

export const consultationTypesRouter = os.router({
    /**
     * Lists all active consultation types.
     *
     * @returns Array of active consultation types
     */
    list: os
        .handler(async () => {
            const repo = new ConsultationTypeRepository();
            return repo.findAll();
        }),

    /**
     * Creates a new consultation type.
     *
     * @param input.label - Type label
     * @param input.amount - Price amount
     * @param input.color - Optional color code
     * @param input.nature - Optional nature (normal or radiography)
     * @returns Created consultation type
     */
    create: os
        .input(z.object({
            label: z.string(),
            amount: z.number(),
            color: z.string().optional(),
            nature: z.enum(['normal', 'radiography']).optional(),
        }))
        .handler(async ({ input }) => {
            const repo = new ConsultationTypeRepository();
            return repo.create(input);
        }),

    /**
     * Updates a consultation type.
     *
     * @param input.id - Consultation type ID
     * @param input.data - Partial consultation type data to update
     * @returns Updated consultation type
     */
    update: os
        .input(z.object({
            id: z.number(),
            data: z.object({
                label: z.string().optional(),
                amount: z.number().optional(),
                color: z.string().optional(),
                is_active: z.number().optional(),
                nature: z.enum(['normal', 'radiography']).optional(),
            }),
        }))
        .handler(async ({ input }) => {
            const repo = new ConsultationTypeRepository();
            return repo.update(input.id, input.data);
        }),

    /**
     * Soft deletes a consultation type by setting is_active to 0.
     *
     * @param input.id - Consultation type ID
     */
    delete: os
        .input(z.object({ id: z.number() }))
        .handler(async ({ input }) => {
            const repo = new ConsultationTypeRepository();
            return repo.delete(input.id);
        }),
});
