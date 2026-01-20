/**
 * Professional Contacts Router
 * 
 * Provides ORPC endpoints for managing professional contacts such as doctors
 * and specialists, including listing, searching, creating, updating, and deleting contacts.
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { ProfessionalContactsRepository, CreateProfessionalContactSchema, ProfessionalContactSchema } from '../../db/repositories/professional_contacts.repository.js';

export const professionalContactsRouter = os.router({
    /**
     * Lists all professional contacts.
     *
     * @returns Array of all professional contacts
     */
    list: os
        .handler(async () => {
            return ProfessionalContactsRepository.findAll();
        }),

    /**
     * Searches professional contacts by name, specialty, or type.
     *
     * @param input.query - Search query string
     * @returns Array of matching professional contacts
     */
    search: os
        .input(z.object({ query: z.string() }))
        .output(z.array(ProfessionalContactSchema))
        .handler(async ({ input }) => {
            return ProfessionalContactsRepository.search(input.query);
        }),

    /**
     * Creates a new professional contact.
     *
     * @param input - Professional contact data
     * @returns Created professional contact
     */
    create: os
        .input(CreateProfessionalContactSchema)
        .output(ProfessionalContactSchema.optional())
        .handler(async ({ input }) => {
            return ProfessionalContactsRepository.create(input);
        }),

    /**
     * Updates a professional contact.
     *
     * @param input.id - Contact ID
     * @param input.data - Partial contact data to update
     * @returns Updated professional contact
     */
    update: os
        .input(
            z.object({
                id: z.string(),
                data: CreateProfessionalContactSchema.partial(),
            })
        )
        .output(ProfessionalContactSchema.optional())
        .handler(async ({ input }) => {
            return ProfessionalContactsRepository.update(input.id, input.data);
        }),

    /**
     * Deletes a professional contact.
     *
     * @param input.id - Contact ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .handler(async ({ input }) => {
            return ProfessionalContactsRepository.delete(input.id);
        })
});
