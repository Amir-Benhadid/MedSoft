/**
 * Appointments Router
 * 
 * Provides ORPC endpoints for managing appointments, including CRUD operations,
 * marking patients as present, and managing dilation requirements.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { AppointmentRepository } from '../../db/repositories/appointment.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const appointmentSchema = z.object({
    id: z.string(),
    patient_id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    arrived_at: z.string().nullable().optional(),
    title: z.string().optional(),
    state: z.enum(['booked', 'present', 'in_consultation', 'in_rehabilitation', 'completed', 'paid', 'creance']),
    type: z.string().optional(),
    notes: z.string().optional(),
    needs_dilation: z.boolean(),
    dilation_status: z.string().optional().nullable(),
    dilation_type: z.string().optional().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    consultation_type_id: z.number().optional(),
});

const createAppointmentSchema = appointmentSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    arrived_at: true,
    dilation_status: true,
});

export const appointmentsRouter = os.router({
    /**
     * Lists all appointments within a date range.
     *
     * @param input.start - Start date in ISO8601 format
     * @param input.end - End date in ISO8601 format
     * @returns Array of appointments with patient details
     */
    list: os
        .input(
            z.object({
                start: z.string(),
                end: z.string(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            return repo.findAllInDateRange(input.start, input.end);
        }),

    /**
     * Creates a new appointment.
     *
     * @param input - Appointment data without id and timestamps
     * @returns Created appointment
     */
    create: os
        .input(createAppointmentSchema)
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const result = repo.create(input);
            broadcastChange('appointments');
            return result;
        }),

    /**
     * Updates an existing appointment.
     *
     * @param input.id - Appointment ID
     * @param input.updates - Partial appointment data to update
     * @returns Updated appointment
     * @throws Error if appointment not found
     */
    update: os
        .input(
            z.object({
                id: z.string(),
                updates: appointmentSchema.partial().omit({ id: true, created_at: true }),
            })
        )
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const result = repo.update(input.id, input.updates);
            if (!result) {
                throw new Error('Appointment not found');
            }
            broadcastChange('appointments');
            return result;
        }),

    /**
     * Deletes an appointment.
     *
     * @param input.id - Appointment ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const success = repo.delete(input.id);
            broadcastChange('appointments');
            return { success };
        }),

    /**
     * Marks an appointment as present (patient has arrived).
     *
     * @param input.id - Appointment ID
     * @param input.arrivedAt - Timestamp when patient arrived
     * @returns Success indicator
     * @throws Error if appointment not found
     */
    markPresent: os
        .input(
            z.object({
                id: z.string(),
                arrivedAt: z.string(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const success = repo.markPresent(input.id, input.arrivedAt);
            if (!success) {
                throw new Error('Appointment not found');
            }
            broadcastChange('appointments');
            return { success };
        }),

    /**
     * Toggles dilation requirement for an appointment.
     *
     * @param input.id - Appointment ID
     * @param input.needsDilation - Whether dilation is needed
     * @param input.dilationType - Optional medicine type for dilation
     * @returns Success indicator
     * @throws Error if appointment not found
     */
    toggleDilation: os
        .input(
            z.object({
                id: z.string(),
                needsDilation: z.boolean(),
                dilationType: z.string().optional(),
            })
        )
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const success = repo.update(input.id, {
                needs_dilation: input.needsDilation,
                dilation_type: input.dilationType
            });
            if (!success) {
                throw new Error('Appointment not found');
            }
            broadcastChange('appointments');
            return { success: true };
        }),

    /**
     * Marks dilation as completed for an appointment.
     *
     * @param input.id - Appointment ID
     * @returns Success indicator
     * @throws Error if appointment not found
     */
    finishDilation: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new AppointmentRepository();
            const success = repo.finishDilation(input.id);
            if (!success) throw new Error('Appointment not found');
            broadcastChange('appointments');
            return { success: true };
        }),

});
