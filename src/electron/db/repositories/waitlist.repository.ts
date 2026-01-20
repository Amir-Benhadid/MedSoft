/**
 * Waitlist Repository
 * 
 * Provides database operations for managing waitlist entries (walk-in patients).
 * Handles patient tracking, dilation management, and state transitions.
 */

import { getDatabase } from '../database.js';
import { randomUUID } from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface WaitlistEntry {
    id: string;
    patient_id: string;
    arrived_at: string;
    state: 'waiting' | 'in_consultation' | 'in_rehabilitation' | 'completed' | 'paid' | 'creance';
    type?: string;
    notes?: string;
    needs_dilation: boolean;
    dilation_status?: string | null;
    dilation_type?: string | null;
    dilation_started_at?: string;
    created_at?: string;
    updated_at?: string;
    consultation_type_id?: number;
    patient_name?: string;
    patient_surname?: string;
}

/**
 * Repository for managing waitlist entries.
 */
export class WaitlistRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Finds all waitlist entries within a date range, including patient and dilation information.
     *
     * @param start - Start date in ISO8601 format
     * @param end - End date in ISO8601 format
     * @returns Array of waitlist entries with patient details
     */
    findAllInDateRange(start: string, end: string): WaitlistEntry[] {
        const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
        let query = '';

        if (hasDilations) {
            query = `
                SELECT 
                    w.id, w.patient_id, w.arrived_at, w.state, w.type, w.notes, w.created_at, w.updated_at,
                    p.name as patient_name, p.surname as patient_surname,
                    d.id as dilation_id, d.status as dilation_status, d.medicine as dilation_medicine, d.created_at as dilation_started_at
                FROM waitlist_entries w
                JOIN patients p ON w.patient_id = p.id
                LEFT JOIN dilations d ON w.id = d.waitlist_entry_id
                WHERE w.arrived_at >= ? AND w.arrived_at < ?
                ORDER BY w.arrived_at ASC
            `;
        } else {
            query = `
                SELECT 
                    w.id, w.patient_id, w.arrived_at, w.state, w.type, w.notes, w.created_at, w.updated_at,
                    p.name as patient_name, p.surname as patient_surname,
                    NULL as dilation_id, NULL as dilation_status, NULL as dilation_medicine, NULL as dilation_started_at
                FROM waitlist_entries w
                JOIN patients p ON w.patient_id = p.id
                WHERE w.arrived_at >= ? AND w.arrived_at < ?
                ORDER BY w.arrived_at ASC
            `;
        }

        const rows = this.db.prepare(query).all(start, end) as any[];

        return rows.map(row => ({
            id: row.id,
            patient_id: row.patient_id,
            arrived_at: row.arrived_at,
            state: row.state,
            type: row.type,
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
            patient_name: row.patient_name,
            patient_surname: row.patient_surname,
            needs_dilation: !!row.dilation_id,
            dilation_status: row.dilation_status,
            dilation_type: row.dilation_medicine,
            dilation_started_at: row.dilation_started_at,
            consultation_type_id: row.consultation_type_id
        }));
    }

    /**
     * Creates a new waitlist entry and optionally creates a dilation record if needed.
     *
     * @param entry - Waitlist entry data without id, timestamps, and patient name fields
     * @returns Created waitlist entry with generated id and timestamps
     */
    create(entry: Omit<WaitlistEntry, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'patient_surname'>): WaitlistEntry {
        const id = randomUUID();
        const now = getLocalISOString();

        const transaction = this.db.transaction(() => {
            const stmt = this.db.prepare(`
				INSERT INTO waitlist_entries (
					id, patient_id, arrived_at, state, type, notes, created_at, updated_at, consultation_type_id
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`);

            stmt.run(
                id,
                entry.patient_id,
                entry.arrived_at,
                entry.state,
                entry.type || 'consultation',
                entry.notes || '',
                now,
                now,
                entry.consultation_type_id || null
            );

            if (entry.needs_dilation) {
                const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
                if (hasDilations) {
                    const dilationId = randomUUID();
                    this.db.prepare(`
						INSERT INTO dilations (id, waitlist_entry_id, patient_id, medicine, status)
						VALUES (?, ?, ?, ?, 'pending')
					`).run(dilationId, id, entry.patient_id, entry.dilation_type || null);
                }
            }
        });

        transaction();

        return {
            id,
            ...entry,
            created_at: now,
            updated_at: now
        };
    }

    /**
     * Deletes a waitlist entry by ID.
     *
     * @param id - Waitlist entry ID
     * @returns True if deletion was successful, false otherwise
     */
    delete(id: string): boolean {
        const result = this.db.prepare('DELETE FROM waitlist_entries WHERE id = ?').run(id);
        return result.changes > 0;
    }

    /**
     * Updates the state of a waitlist entry.
     *
     * @param id - Waitlist entry ID
     * @param state - New state value
     * @returns True if update was successful, false otherwise
     */
    updateStatus(id: string, state: string): boolean {
        const result = this.db.prepare("UPDATE waitlist_entries SET state = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run(state, id);
        return result.changes > 0;
    }

    /**
     * Toggles dilation requirement for a waitlist entry.
     *
     * @param id - Waitlist entry ID
     * @param needsDilation - Whether dilation is needed
     * @param medicine - Optional medicine name for dilation
     * @returns True if operation was successful
     */
    toggleDilation(id: string, needsDilation: boolean, medicine?: string): boolean {
        const transaction = this.db.transaction(() => {
            const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
            if (!hasDilations) return;

            if (needsDilation) {
                const existing = this.db.prepare('SELECT id FROM dilations WHERE waitlist_entry_id = ?').get(id);
                if (!existing) {
                    const entry = this.db.prepare('SELECT patient_id FROM waitlist_entries WHERE id = ?').get(id) as any;
                    if (entry) {
                        this.db.prepare(`
                            INSERT INTO dilations (id, waitlist_entry_id, patient_id, medicine, status)
                            VALUES (?, ?, ?, ?, 'pending')
                        `).run(randomUUID(), id, entry.patient_id, medicine || null);

                        this.db.prepare("UPDATE waitlist_entries SET state = ?, updated_at = datetime('now', 'localtime') WHERE id = ?").run('waiting', id);
                    }
                } else if (medicine !== undefined) {
                    this.db.prepare('UPDATE dilations SET medicine = ? WHERE waitlist_entry_id = ?').run(medicine, id);
                }
            } else {
                this.db.prepare('DELETE FROM dilations WHERE waitlist_entry_id = ?').run(id);
            }
            this.db.prepare("UPDATE waitlist_entries SET updated_at = datetime('now', 'localtime') WHERE id = ?").run(id);
        });
        transaction();
        return true;
    }

    /**
     * Marks dilation as completed for a waitlist entry.
     *
     * @param id - Waitlist entry ID
     * @returns True if update was successful, false if dilations table doesn't exist
     */
    finishDilation(id: string): boolean {
        const hasDilations = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dilations'").get();
        if (!hasDilations) return false;

        const result = this.db.prepare("UPDATE dilations SET status = 'dilated' WHERE waitlist_entry_id = ?").run(id);
        this.db.prepare("UPDATE waitlist_entries SET updated_at = datetime('now', 'localtime') WHERE id = ?").run(id);
        return result.changes > 0;
    }
}
