/**
 * Appointment Repository
 * 
 * Provides database operations for managing appointments, including scheduling,
 * patient tracking, and dilation management. Handles appointment lifecycle states
 * and integrates with patient and dilation data.
 */

import { getDatabase } from '../database.js';
import { randomUUID } from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface Appointment {
    id: string;
    patient_id: string;
    start_time: string;
    end_time: string;
    arrived_at?: string | null;
    title?: string;
    state: 'booked' | 'present' | 'in_consultation' | 'in_rehabilitation' | 'completed' | 'paid' | 'creance';
    type?: string;
    notes?: string;
    needs_dilation: boolean;
    dilation_status?: string | null;
    dilation_type?: string | null;
    dilation_started_at?: string;
    created_at?: string;
    updated_at?: string;
    consultation_type_id?: number;
}

export interface AppointmentWithPatient extends Appointment {
    patient: {
        name: string;
        surname: string;
        dob: string;
        phone: string;
        address: {
            street: string;
            city: string;
        };
    } | null;
}

/**
 * Repository for managing appointment data and operations.
 */
export class AppointmentRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Finds all appointments within a date range, including patient and dilation information.
     *
     * @param start - Start date in ISO8601 format (YYYY-MM-DDTHH:mm:ss)
     * @param end - End date in ISO8601 format (YYYY-MM-DDTHH:mm:ss)
     * @returns Array of appointments with patient details
     */
    findAllInDateRange(start: string, end: string): AppointmentWithPatient[] {
        const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();

        let query = '';
        if (hasDilations) {
            query = `
                SELECT 
                    a.id, a.patient_id, a.start_time, a.end_time, a.arrived_at, 
                    a.title, a.state, a.type, a.notes, a.created_at, a.updated_at, a.consultation_type_id,
                    d.id as dilation_id, d.status as dilation_status, d.medicine as dilation_medicine, d.created_at as dilation_started_at,
                    p.name as patient_name, p.surname as patient_surname, p.dob as patient_dob,
                    p.phone_number as patient_phone, p.street as patient_street, p.city as patient_city
                FROM appointments a
                LEFT JOIN dilations d ON a.id = d.appointment_id
                LEFT JOIN patients p ON a.patient_id = p.id
                WHERE a.start_time >= ? AND a.start_time < ?
                ORDER BY a.start_time ASC
            `;
        } else {
            query = `
                SELECT 
                    a.id, a.patient_id, a.start_time, a.end_time, a.arrived_at, 
                    a.title, a.state, a.type, a.notes, a.created_at, a.updated_at, a.consultation_type_id,
                    NULL as dilation_id, NULL as dilation_status, NULL as dilation_medicine, NULL as dilation_started_at,
                    p.name as patient_name, p.surname as patient_surname, p.dob as patient_dob,
                    p.phone_number as patient_phone, p.street as patient_street, p.city as patient_city
                FROM appointments a
                LEFT JOIN patients p ON a.patient_id = p.id
                WHERE a.start_time >= ? AND a.start_time < ?
                ORDER BY a.start_time ASC
            `;
        }

        const rows = this.db.prepare(query).all(start, end) as any[];

        return rows.map(row => ({
            id: row.id,
            patient_id: row.patient_id,
            start_time: row.start_time,
            end_time: row.end_time,
            arrived_at: row.arrived_at,
            title: row.title,
            state: row.state,
            type: row.type,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            consultation_type_id: row.consultation_type_id,
            needs_dilation: !!row.dilation_id,
            dilation_status: row.dilation_status,
            dilation_type: row.dilation_medicine,
            dilation_started_at: row.dilation_started_at,
            patient: row.patient_name ? {
                name: row.patient_name,
                surname: row.patient_surname,
                dob: row.patient_dob,
                phone: row.patient_phone,
                address: {
                    street: row.patient_street,
                    city: row.patient_city
                }
            } : null
        }));
    }


    /**
     * Creates a new appointment and optionally creates a dilation record if needed.
     *
     * @param appointment - Appointment data without id, created_at, and updated_at
     * @returns The created appointment with generated id and timestamps
     */
    create(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Appointment {
        const id = randomUUID();
        const now = getLocalISOString();

        const transaction = this.db.transaction(() => {
            const stmt = this.db.prepare(`
				INSERT INTO appointments (
					id, patient_id, start_time, end_time, title, state, 
					type, notes, created_at, updated_at, consultation_type_id
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

            stmt.run(
                id,
                appointment.patient_id,
                appointment.start_time,
                appointment.end_time,
                appointment.title || '',
                appointment.state,
                appointment.type || 'consultation',
                appointment.notes || '',
                now,
                now,
                appointment.consultation_type_id || null
            );

            if (appointment.needs_dilation) {
                const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
                if (hasDilations) {
                    const dilationId = randomUUID();
                    this.db.prepare(`
						INSERT INTO dilations (id, appointment_id, patient_id, medicine, status)
						VALUES (?, ?, ?, ?, 'pending')
					`).run(dilationId, id, appointment.patient_id, appointment.dilation_type || null);
                }
            }
        });

        transaction();

        return {
            id,
            ...appointment,
            created_at: now,
            updated_at: now
        };
    }

    /**
     * Updates an appointment and handles dilation-related updates.
     * Separates appointment field updates from dilation management.
     *
     * @param id - Appointment ID
     * @param updates - Partial appointment data to update
     * @returns Updated appointment or null if not found
     */
    update(id: string, updates: Partial<Appointment>): Appointment | null {
        const transaction = this.db.transaction(() => {
            const appointmentUpdates: any = { ...updates };
            delete appointmentUpdates.needs_dilation;
            delete appointmentUpdates.dilation_status;
            delete appointmentUpdates.dilation_type;

            if (Object.keys(appointmentUpdates).length > 0) {
                const sets: string[] = [];
                const values: any[] = [];
                const now = getLocalISOString();

                Object.entries(appointmentUpdates).forEach(([key, value]) => {
                    if (key === 'id' || key === 'created_at') return;
                    sets.push(`${key} = ?`);
                    values.push(value);
                });

                sets.push('updated_at = ?');
                values.push(now);
                values.push(id);

                const query = `UPDATE appointments SET ${sets.join(', ')} WHERE id = ?`;
                this.db.prepare(query).run(...values);
            }

            const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();

            if (hasDilations) {
                if (updates.hasOwnProperty('needs_dilation')) {
                    if (updates.needs_dilation) {
                        const existing = this.db.prepare('SELECT id FROM dilations WHERE appointment_id = ?').get(id);
                        if (!existing) {
                            const patientId = this.db.prepare('SELECT patient_id FROM appointments WHERE id = ?').get(id) as any;
                            if (patientId) {
                                this.db.prepare(`
									INSERT INTO dilations (id, appointment_id, patient_id, medicine, status)
									VALUES (?, ?, ?, ?, 'pending')
								`).run(randomUUID(), id, patientId.patient_id, updates.dilation_type || null);

                                this.db.prepare("UPDATE appointments SET state = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run('present', id);
                            }
                        } else if (updates.dilation_type !== undefined) {
                            this.db.prepare('UPDATE dilations SET medicine = ? WHERE appointment_id = ?').run(updates.dilation_type, id);
                        }
                    } else {
                        this.db.prepare('DELETE FROM dilations WHERE appointment_id = ?').run(id);
                    }
                } else if (updates.dilation_type !== undefined) {
                    this.db.prepare('UPDATE dilations SET medicine = ? WHERE appointment_id = ?').run(updates.dilation_type, id);
                }
            }
        });

        transaction();

        return this.findById(id);
    }

    /**
     * Deletes an appointment by ID.
     *
     * @param id - Appointment ID
     * @returns True if deletion was successful, false otherwise
     */
    delete(id: string): boolean {
        const result = this.db.prepare('DELETE FROM appointments WHERE id = ?').run(id);
        return result.changes > 0;
    }

    /**
     * Finds an appointment by ID, including dilation information if available.
     *
     * @param id - Appointment ID
     * @returns Appointment or null if not found
     */
    findById(id: string): Appointment | null {
        const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
        let query = '';

        if (hasDilations) {
            query = `
                SELECT 
                    a.*,
                    d.id as dilation_id, d.status as dilation_status, d.medicine as dilation_medicine
                FROM appointments a
                LEFT JOIN dilations d ON a.id = d.appointment_id
                WHERE a.id = ?
            `;
        } else {
            query = `
                SELECT 
                    a.*,
                    NULL as dilation_id, NULL as dilation_status, NULL as dilation_medicine
                FROM appointments a
                WHERE a.id = ?
            `;
        }
        const row = this.db.prepare(query).get(id) as any;
        if (!row) return null;

        return {
            id: row.id,
            patient_id: row.patient_id,
            start_time: row.start_time,
            end_time: row.end_time,
            arrived_at: row.arrived_at,
            title: row.title,
            state: row.state,
            type: row.type,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            needs_dilation: !!row.dilation_id,
            dilation_status: row.dilation_status,
            dilation_type: row.dilation_medicine,
            consultation_type_id: row.consultation_type_id
        };
    }

    /**
     * Marks an appointment as present (patient has arrived).
     *
     * @param id - Appointment ID
     * @param arrivedAt - Timestamp when patient arrived (ISO8601 format)
     * @returns True if update was successful, false otherwise
     */
    markPresent(id: string, arrivedAt: string): boolean {
        const result = this.db.prepare(`
			UPDATE appointments 
			SET state = 'present', arrived_at = ?, updated_at = ?
			WHERE id = ?
		`).run(arrivedAt, arrivedAt, id);
        return result.changes > 0;
    }

    /**
     * Toggles dilation requirement for an appointment.
     *
     * @param id - Appointment ID
     * @param needsDilation - Whether dilation is needed
     * @returns True if operation was successful
     */
    toggleDilation(id: string, needsDilation: boolean): boolean {
        const transaction = this.db.transaction(() => {
            const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
            if (!hasDilations) return;

            if (needsDilation) {
                const existing = this.db.prepare('SELECT id FROM dilations WHERE appointment_id = ?').get(id);
                if (!existing) {
                    const patientIdRow = this.db.prepare('SELECT patient_id FROM appointments WHERE id = ?').get(id) as any;
                    if (patientIdRow) {
                        this.db.prepare(`
                            INSERT INTO dilations (id, appointment_id, patient_id, status)
                            VALUES (?, ?, ?, 'pending')
                        `).run(randomUUID(), id, patientIdRow.patient_id);
                    }
                }
            } else {
                this.db.prepare('DELETE FROM dilations WHERE appointment_id = ?').run(id);
            }
            this.db.prepare("UPDATE appointments SET updated_at = datetime('now', 'localtime') WHERE id = ?").run(id);
        });
        transaction();
        return true;
    }

    /**
     * Marks dilation as completed for an appointment.
     *
     * @param id - Appointment ID
     * @returns True if update was successful, false if dilations table doesn't exist
     */
    finishDilation(id: string): boolean {
        const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
        if (!hasDilations) return false;

        const result = this.db.prepare("UPDATE dilations SET status = 'dilated' WHERE appointment_id = ?").run(id);
        this.db.prepare("UPDATE appointments SET updated_at = datetime('now', 'localtime') WHERE id = ?").run(id);
        return result.changes > 0;
    }

}
