/**
 * Radiography Router
 * 
 * Provides ORPC endpoints for managing radiography document definitions
 * and their associated fields.
 */

import { os } from '@orpc/server';
import { RadiographyRepository } from '../../db/repositories/radiography.repository.js';
import { z } from 'zod';

export const radiographyRouter = os.router({
    /**
     * Lists all document definitions with their fields.
     */
    listDocuments: os
        .handler(async () => {
            const repo = new RadiographyRepository();
            return repo.findAllDocuments();
        }),

    /**
     * Create a new document definition.
     */
    createDocument: os
        .input(z.object({
            title: z.string()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.createDocument(input.title);
        }),

    /**
     * Update document title
     */
    updateDocument: os
        .input(z.object({
            id: z.string(),
            title: z.string()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.updateDocument(input.id, input.title);
        }),

    /**
     * Delete a document definition.
     */
    deleteDocument: os
        .input(z.object({
            id: z.string()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.deleteDocument(input.id);
        }),

    /**
     * Create a field definition.
     */
    createField: os
        .input(z.object({
            documentId: z.string(),
            label: z.string(),
            defaultValues: z.array(z.string()).optional()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.createField(input.documentId, input.label, input.defaultValues || []);
        }),

    /**
     * Update a field definition.
     */
    updateField: os
        .input(z.object({
            id: z.string(),
            label: z.string().optional(),
            defaultValues: z.array(z.string()).optional()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.updateField(input.id, {
                label: input.label,
                default_values: input.defaultValues
            });
        }),

    /**
     * Delete a field definition.
     */
    deleteField: os
        .input(z.object({
            id: z.string()
        }))
        .handler(async ({ input }) => {
            const repo = new RadiographyRepository();
            return repo.deleteField(input.id);
        }),
});
