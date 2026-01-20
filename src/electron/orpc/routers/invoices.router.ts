/**
 * Invoices Router
 * 
 * Provides ORPC endpoints for managing invoices, including retrieving invoices
 * by consultation ID, updating payment information, and counting pending invoices.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { InvoiceRepository } from '../../db/repositories/invoice.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

export const invoicesRouter = os.router({
    /**
     * Gets an invoice by consultation ID.
     *
     * @param input.consultationId - Consultation ID
     * @returns Invoice or null if not found
     */
    getByConsultationId: os
        .input(z.object({ consultationId: z.string() }))
        .handler(async ({ input }) => {
            const repo = new InvoiceRepository();
            return repo.findByConsultationId(input.consultationId);
        }),

    /**
     * Updates an invoice.
     *
     * @param input.id - Invoice ID
     * @param input.updates - Partial invoice data to update
     * @returns Success indicator
     */
    update: os
        .input(z.object({
            id: z.string(),
            updates: z.object({
                paid: z.number().optional(),
                method: z.string().optional(),
            })
        }))
        .handler(async ({ input }) => {
            const repo = new InvoiceRepository();
            const success = repo.update(input.id, input.updates);
            if (success) {
                broadcastChange('invoices');
            }
            return { success };
        }),

    /**
     * Marks an invoice as fully paid.
     *
     * @param input.id - Invoice ID
     * @returns Success indicator
     */
    markPaid: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new InvoiceRepository();
            const success = repo.markAsPaid(input.id);
            if (success) {
                broadcastChange('invoices');
            }
            return { success };
        }),

    /**
     * Counts invoices with pending payments.
     *
     * @returns Object with count of pending invoices
     */
    countPending: os
        .handler(async () => {
            const repo = new InvoiceRepository();
            return { count: repo.countPending() };
        }),
});
