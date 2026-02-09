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
    /**
     * Searches patients by multiple criteria (smart search).
     * 
     * Handles:
     * - Multi-token search (AND logic)
     * - Name, Surname, Phone Number, City, Street
     * - Date of Birth (partial matching for day, month name, or year)
     *
     * @param term - Search string
     * @returns Array of matching patients (limited to 50 results)
     */
    search(term: string): Patient[] {
        const tokens = term.trim().split(/\s+/);
        if (tokens.length === 0) return [];

        let query = `SELECT * FROM patients WHERE 1=1`;
        const params: any[] = [];

        // Map French and English month names/abbreviations to digits
        const months: Record<string, string> = {
            'jan': '01', 'janvier': '01', 'january': '01',
            'fev': '02', 'fév': '02', 'fevrier': '02', 'février': '02', 'feb': '02', 'february': '02',
            'mar': '03', 'mars': '03', 'march': '03',
            'avr': '04', 'avril': '04', 'apr': '04', 'april': '04',
            'mai': '05', 'may': '05',
            'jun': '06', 'juin': '06', 'june': '06',
            'jul': '07', 'juil': '07', 'juillet': '07', 'july': '07',
            'aou': '08', 'août': '08', 'aout': '08', 'aug': '08', 'august': '08',
            'sep': '09', 'sept': '09', 'septembre': '09', 'september': '09',
            'oct': '10', 'octobre': '10', 'october': '10',
            'nov': '11', 'novembre': '11', 'november': '11',
            'dec': '12', 'déc': '12', 'decembre': '12', 'décembre': '12', 'december': '12'
        };

        for (const token of tokens) {
            const tokenPattern = `%${token}%`;
            // Standard text fields with fuzzy support
            // fuzzy_contains(column, token, 1) returns 1 if fuzzy match or exact substring match found
            const conditions = [
                `fuzzy_contains(name, ?, 1)`,
                `fuzzy_contains(surname, ?, 1)`,
                `fuzzy_contains(phone_number, ?, 1)`,
                `fuzzy_contains(city, ?, 1)`,
                `fuzzy_contains(street, ?, 1)`
            ];
            // We pass the RAW token to fuzzy_contains, not the %pattern%
            const tokenParams = [token, token, token, token, token];

            // Smart Date Handling for DOB (YYYY-MM-DD)

            // 1. Exact number match (Day or Year)
            // e.g., "29" matches "....-..-29" OR "2029-..-.."
            if (/^\d+$/.test(token)) {
                // If it's a 4-digit number, prioritize year check, but still allow generic match
                conditions.push(`dob LIKE ?`);
                tokenParams.push(tokenPattern);
            }

            // 2. Formatted date part match (e.g., "29/10" -> search for "-10-29")
            if (token.includes('/')) {
                const parts = token.split('/');
                if (parts.length === 2) {
                    // Assume DD/MM input -> Match "-MM-DD"
                    // Pad with 0 if needed
                    const d = parts[0].padStart(2, '0');
                    const m = parts[1].padStart(2, '0');
                    conditions.push(`dob LIKE ?`);
                    tokenParams.push(`%-${m}-${d}%`);
                }
            }

            // 3. Month Name match
            const lowerToken = token.toLowerCase();
            // Check if token matches any month prefix (min 3 chars to avoid false positives with random letters)
            if (lowerToken.length >= 3) {
                for (const [name, digit] of Object.entries(months)) {
                    if (name.startsWith(lowerToken)) {
                        conditions.push(`dob LIKE ?`);
                        // Match month in middle: YYYY-MM-DD -> %-MM-%
                        tokenParams.push(`%-${digit}-%`);
                        // Don't break, might match multiple (rare) or just add one
                        break;
                    }
                }
            }

            query += ` AND (${conditions.join(' OR ')})`;
            params.push(...tokenParams);
        }

        query += ` ORDER BY surname ASC, name ASC LIMIT 50`;

        return this.db.prepare(query).all(...params) as Patient[];
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
