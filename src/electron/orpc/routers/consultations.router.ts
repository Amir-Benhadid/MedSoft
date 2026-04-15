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
import { getLocalISOString } from '../../lib/time.js';

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
                broadcastChange('consultations', result.id);
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

            // Critical: If finishing consultation, also mark Appointment/Waitlist as completed
            if (input.updates.status === 'completed') {
                const consultation = repo.findById(input.id);
                if (consultation) {
                    const AppointmentRepository = (await import('../../db/repositories/appointment.repository.js')).AppointmentRepository;
                    const WaitlistRepository = (await import('../../db/repositories/waitlist.repository.js')).WaitlistRepository;
                    const appointmentRepo = new AppointmentRepository();
                    const waitlistRepo = new WaitlistRepository();

                    // Find active appointment or waitlist entry for this patient today (or recent)
                    // We assume the consultation is linked to today's activity.
                    const today = getLocalISOString().split('T')[0]; // Simple YYYY-MM-DD

                    // Try to find active appointment
                    const appointments = appointmentRepo.findAllInDateRange(today, `${today}T23:59:59`);
                    const activeAppt = appointments.find(a => a.patient_id === consultation.patient_id && a.state !== 'completed' && a.state !== 'paid');

                    if (activeAppt) {
                        appointmentRepo.update(activeAppt.id, { state: 'completed' });
                        broadcastChange('appointments');
                    } else {
                        // Try waitlist
                        const waitlist = waitlistRepo.findAllInDateRange(today, `${today}T23:59:59`);
                        const activeEntry = waitlist.find(w => w.patient_id === consultation.patient_id && w.state !== 'completed' && w.state !== 'paid');

                        if (activeEntry) {
                            waitlistRepo.updateStatus(activeEntry.id, 'completed');
                            broadcastChange('waitlist');
                        }
                    }
                }
            }

            // --- AUDIT LOGGING ---
            const currentData = repo.findById(input.id);
            if (currentData) {
                try {
                    const db = (await import('../../db/database.js')).getDatabase();
                    const hasSnapshotsTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='consultation_snapshots'").get();
                    if (hasSnapshotsTable) {
                        db.prepare(`
                            INSERT INTO consultation_snapshots (consultation_id, snapshot_data, snapshot_type)
                            VALUES (?, ?, ?)
                        `).run(
                            input.id,
                            JSON.stringify(currentData),
                            input.updates.status === 'completed' && currentData.status !== 'completed' ? 'completion' : 'auto_save'
                        );
                    }
                } catch(e) {
                    console.warn("Could not save snapshot", e);
                }
            }
            // ---------------------

            const success = repo.update(input.id, input.updates);
            if (success) {
                broadcastChange('consultations', input.id);
                if (input.updates.payment) {
                    broadcastChange('invoices');
                    broadcastChange('appointments');
                    broadcastChange('waitlist');
                }
            }
            return { success };
        }),
});
