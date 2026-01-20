/**
 * Patient Repository
 * 
 * Provides database operations for managing patient records, including
 * personal information, medical history (antecedents), and contact details.
 */

import { getDatabase } from '../database.js';
import { randomUUID } from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface Patient {
    id: string;
    name: string;
    surname: string;
    dob?: string | null;
    phone_number?: string | null;
    street?: string | null;
    city?: string | null;
    oph_ants?: string | null;
    gen_ants?: string | null;
    created_at?: string;
    updated_at?: string;
}

/**
 * Repository for managing patient data.
 */
export class PatientRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Finds all patients, ordered by surname and name.
     *
     * @returns Array of all patients
     */
    findAll(): Patient[] {
        const query = `SELECT * FROM patients ORDER BY surname ASC, name ASC`;
        return this.db.prepare(query).all() as Patient[];
    }

    /**
     * Searches patients by name, surname, or phone number.
     *
     * @param term - Search term
     * @returns Array of matching patients (limited to 50 results)
     */
    search(term: string): Patient[] {
        const query = `
            SELECT * FROM patients 
            WHERE name LIKE ? OR surname LIKE ? OR phone_number LIKE ?
            ORDER BY surname ASC, name ASC
            LIMIT 50
        `;
        const pattern = `%${term}%`;
        return this.db.prepare(query).all(pattern, pattern, pattern) as Patient[];
    }

    /**
     * Finds a patient by ID.
     *
     * @param id - Patient ID
     * @returns Patient or null if not found
     */
    findById(id: string): Patient | null {
        const query = `SELECT * FROM patients WHERE id = ?`;
        return this.db.prepare(query).get(id) as Patient | null;
    }

    /**
     * Creates a new patient record.
     *
     * @param patient - Patient data without id, created_at, and updated_at
     * @returns Created patient with generated id and timestamps
     */
    create(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Patient {
        const id = randomUUID();
        const now = getLocalISOString();

        const stmt = this.db.prepare(`
            INSERT INTO patients (
                id, name, surname, dob, phone_number, street, city, oph_ants, gen_ants, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            patient.name,
            patient.surname,
            patient.dob || null,
            patient.phone_number || null,
            patient.street || null,
            patient.city || null,
            patient.oph_ants || null,
            patient.gen_ants || null,
            now,
            now
        );

        return {
            id,
            ...patient,
            created_at: now,
            updated_at: now
        };
    }

    /**
     * Updates a patient record by ID.
     *
     * @param id - Patient ID
     * @param updates - Partial patient data to update
     * @returns Updated patient or null if not found
     */
    update(id: string, updates: Partial<Patient>): Patient | null {
        const sets: string[] = [];
        const values: any[] = [];
        const now = getLocalISOString();

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'id' || key === 'created_at') return;
            sets.push(`${key} = ?`);
            values.push(value);
        });

        if (sets.length === 0) return this.findById(id);

        sets.push('updated_at = ?');
        values.push(now);
        values.push(id);

        const query = `UPDATE patients SET ${sets.join(', ')} WHERE id = ?`;
        const result = this.db.prepare(query).run(...values);

        if (result.changes === 0) return null;

        return this.findById(id);
    }

    /**
     * Deletes a patient by ID.
     *
     * @param id - Patient ID
     * @returns True if deletion was successful, false otherwise
     */
    delete(id: string): boolean {
        const result = this.db.prepare('DELETE FROM patients WHERE id = ?').run(id);
        return result.changes > 0;
    }
}
