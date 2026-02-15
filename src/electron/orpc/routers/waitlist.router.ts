/**
 * Waitlist Router
 * 
 * Provides ORPC endpoints for managing waitlist entries (walk-in patients),
 * including listing entries in a date range, adding/removing entries, updating
 * status, and managing dilation requirements.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { WaitlistRepository } from '../../db/repositories/waitlist.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const waitlistEntrySchema = z.object({
    id: z.string(),
    patient_id: z.string(),
    arrived_at: z.string(),
    state: z.enum(['waiting', 'in_consultation', 'in_rehabilitation', 'completed', 'paid', 'creance']),
    type: z.string().optional(),
    notes: z.string().optional(),
    needs_dilation: z.boolean(),
    dilation_status: z.string().optional().nullable(),
    dilation_type: z.string().optional().nullable(),
    dilation_eye: z.string().optional().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    consultation_type_id: z.number().optional(),
});

const createWaitlistEntrySchema = waitlistEntrySchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    dilation_status: true,
});

export const waitlistRouter = os.router({
    /**
     * Lists all waitlist entries within a date range.
     *
     * @param input.start - Start date in ISO8601 format
     * @param input.end - End date in ISO8601 format
     * @returns Array of waitlist entries with patient details
     */
    list: os
        .input(
            z.object({
                start: z.string(),
                end: z.string(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            return repo.findAllInDateRange(input.start, input.end);
        }),

    /**
     * Adds a new waitlist entry.
     *
     * @param input - Waitlist entry data without id and timestamps
     * @returns Created waitlist entry
     */
    add: os
        .input(createWaitlistEntrySchema)
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            const result = repo.create(input);
            broadcastChange('waitlist');
            return result;
        }),

    /**
     * Removes a waitlist entry.
     *
     * @param input.id - Waitlist entry ID
     * @returns Success indicator
     */
    remove: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            const success = repo.delete(input.id);
            broadcastChange('waitlist');
            return { success };
        }),

    /**
     * Updates the state of a waitlist entry.
     *
     * @param input.id - Waitlist entry ID
     * @param input.state - New state value
     * @returns Success indicator
     * @throws Error if waitlist entry not found
     */
    updateStatus: os
        .input(
            z.object({
                id: z.string(),
                state: z.string(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            const success = repo.updateStatus(input.id, input.state);
            if (!success) {
                throw new Error('Waitlist entry not found');
            }
            broadcastChange('waitlist');
            return { success };
        }),

    /**
     * Toggles dilation requirement for a waitlist entry.
     *
     * @param input.id - Waitlist entry ID
     * @param input.needsDilation - Whether dilation is needed
     * @param input.dilationMedicine - Optional medicine name for dilation
     * @returns Success indicator
     * @throws Error if waitlist entry not found
     */
    toggleDilation: os
        .input(
            z.object({
                id: z.string(),
                needsDilation: z.boolean(),
                dilationMedicine: z.string().optional(),
                eye: z.string().optional(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            const success = repo.toggleDilation(input.id, input.needsDilation, input.dilationMedicine, input.eye);
            if (!success) {
                throw new Error('Waitlist entry not found');
            }
            broadcastChange('waitlist');
            return { success };
        }),

    /**
     * Marks dilation as completed for a waitlist entry.
     *
     * @param input.id - Waitlist entry ID
     * @returns Success indicator
     * @throws Error if waitlist entry not found or dilation not active
     */
    finishDilation: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new WaitlistRepository();
            const success = repo.finishDilation(input.id);
            if (!success) throw new Error('Waitlist entry not found or dilation not active');
            broadcastChange('waitlist');
            return { success };
        }),
});
