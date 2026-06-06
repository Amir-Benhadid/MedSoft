/**
 * Patient Repository
 * 
 * Provides database operations for managing patient records, including
 * personal information, medical history (antecedents), and contact details.
 */

import { getDatabase } from '../database.js';
import { randomUUID } from 'crypto';
import { getLocalISOString } from '../../lib/time.js';
import { toTitleCase } from '../../lib/formatters.js';

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

export type DuplicateConfidence = 'high' | 'medium';

export interface PatientDuplicateCandidate extends Patient {
    confidence: DuplicateConfidence;
    reasons: string[];
}

export interface PatientSearchResult extends Patient {
    duplicate_count: number;
    duplicate_candidates: PatientDuplicateCandidate[];
}

export interface MergePatientsInput {
    survivor_id: string;
    duplicate_ids: string[];
    resolved_patient: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>;
}

interface DuplicateMatchContext {
    exactNameMatch: boolean;
    sameDob: boolean;
    sameBirthYear: boolean;
    sameCity: boolean;
    surnameDistance: number;
    nameDistance: number;
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
        const rows = this.db.prepare(query).all() as any[];
        return rows.map(row => this.mapRow(row));
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
    search(term: string): PatientSearchResult[] {
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

        const rows = this.db.prepare(query).all(...params) as any[];
        return rows.map(row => this.attachDuplicateMetadata(this.mapRow(row)));
    }

    findPotentialDuplicates(patient: Partial<Patient> & Pick<Patient, 'name' | 'surname'>, excludeIds: string[] = []): PatientDuplicateCandidate[] {
        return this.findDuplicateCandidates(patient, excludeIds);
    }

    /**
     * Finds a patient by ID.
     *
     * @param id - Patient ID
     * @returns Patient or null if not found
     */
    findById(id: string): Patient | null {
        const query = `SELECT * FROM patients WHERE id = ?`;
        const row = this.db.prepare(query).get(id);
        return row ? this.mapRow(row) : null;
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

        const name = toTitleCase(patient.name);
        const surname = toTitleCase(patient.surname);

        stmt.run(
            id,
            name,
            surname,
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
            name,
            surname,
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
            if (key === 'name' || key === 'surname') {
                values.push(toTitleCase(value as string));
            } else {
                values.push(value);
            }
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

    mergePatients(input: MergePatientsInput): Patient {
        const duplicateIds = Array.from(new Set(input.duplicate_ids.filter(id => id && id !== input.survivor_id)));
        if (duplicateIds.length === 0) {
            throw new Error('At least one duplicate patient must be selected');
        }

        const survivor = this.findById(input.survivor_id);
        if (!survivor) {
            throw new Error('Survivor patient not found');
        }

        const duplicates = duplicateIds
            .map(id => this.findById(id))
            .filter((patient): patient is Patient => patient !== null);

        if (duplicates.length !== duplicateIds.length) {
            throw new Error('One or more duplicate patients were not found');
        }

        const mergedPatient = this.buildMergedPatient(survivor, duplicates, input.resolved_patient);
        const now = getLocalISOString();
        const fullName = `${toTitleCase(mergedPatient.surname || '')}   ${toTitleCase(mergedPatient.name || '')}`.trim();

        const transaction = this.db.transaction(() => {
            const patientIdTables = [
                'appointments',
                'waitlist_entries',
                'consultations',
                'dilations',
                'shared_records',
                'invoices'
            ];

            for (const duplicateId of duplicateIds) {
                for (const table of patientIdTables) {
                    if (!this.tableHasColumn(table, 'patient_id')) continue;
                    this.db.prepare(`UPDATE ${table} SET patient_id = ? WHERE patient_id = ?`).run(input.survivor_id, duplicateId);
                }

                this.db.prepare('DELETE FROM patients WHERE id = ?').run(duplicateId);
            }

            this.db.prepare(`
                UPDATE patients
                SET name = ?, surname = ?, dob = ?, phone_number = ?, street = ?, city = ?, oph_ants = ?, gen_ants = ?, updated_at = ?
                WHERE id = ?
            `).run(
                toTitleCase(mergedPatient.name || ''),
                toTitleCase(mergedPatient.surname || ''),
                mergedPatient.dob || null,
                mergedPatient.phone_number || null,
                mergedPatient.street || null,
                mergedPatient.city || null,
                mergedPatient.oph_ants || null,
                mergedPatient.gen_ants || null,
                now,
                input.survivor_id
            );

            if (this.tableHasColumn('appointments', 'title')) {
                this.db.prepare('UPDATE appointments SET title = ?, updated_at = ? WHERE patient_id = ?').run(fullName, now, input.survivor_id);
            }
        });

        transaction();

        const finalPatient = this.findById(input.survivor_id);
        if (!finalPatient) {
            throw new Error('Merged patient not found after merge');
        }

        return finalPatient;
    }

    private attachDuplicateMetadata(patient: Patient): PatientSearchResult {
        const candidates = this.findDuplicateCandidates(patient, [patient.id]);
        return {
            ...patient,
            duplicate_count: candidates.length,
            duplicate_candidates: candidates
        };
    }

    private findDuplicateCandidates(patient: Partial<Patient> & Pick<Patient, 'name' | 'surname'>, excludeIds: string[] = []): PatientDuplicateCandidate[] {
        const normalizedName = this.normalizeStr(patient.name);
        const normalizedSurname = this.normalizeStr(patient.surname);
        if (!normalizedName || !normalizedSurname) return [];

        const excluded = new Set(excludeIds);
        const candidates = this.findAll().filter(candidate => !excluded.has(candidate.id));

        return candidates
            .map(candidate => {
                const match = this.scoreDuplicateMatch(patient, candidate);
                if (!match) return null;

                return {
                    ...candidate,
                    confidence: match.confidence,
                    reasons: match.reasons
                } satisfies PatientDuplicateCandidate;
            })
            .filter((candidate): candidate is PatientDuplicateCandidate => candidate !== null)
            .sort((a, b) => {
                if (a.confidence !== b.confidence) return a.confidence === 'high' ? -1 : 1;
                return (a.surname || '').localeCompare(b.surname || '') || (a.name || '').localeCompare(b.name || '');
            })
            .slice(0, 5);
    }

    private scoreDuplicateMatch(source: Partial<Patient> & Pick<Patient, 'name' | 'surname'>, candidate: Patient): { confidence: DuplicateConfidence; reasons: string[] } | null {
        const sourceName = this.normalizeStr(source.name);
        const sourceSurname = this.normalizeStr(source.surname);
        const candidateName = this.normalizeStr(candidate.name);
        const candidateSurname = this.normalizeStr(candidate.surname);

        if (!sourceName || !sourceSurname || !candidateName || !candidateSurname) return null;

        const context = this.buildDuplicateContext(source, candidate, sourceName, sourceSurname, candidateName, candidateSurname);
        const reasons: string[] = [];

        if (context.exactNameMatch) reasons.push('same-full-name');
        if (context.sameDob) reasons.push('same-dob');
        if (context.sameBirthYear) reasons.push('same-birth-year');
        if (context.sameCity) reasons.push('same-city');
        if (!context.exactNameMatch && context.surnameDistance <= 1 && context.nameDistance <= 1) reasons.push('close-spelling');

        const isHighConfidence =
            (context.exactNameMatch && context.sameDob) ||
            (context.exactNameMatch && context.sameBirthYear) ||
            (context.exactNameMatch && context.sameCity && (!source.dob || !candidate.dob));

        if (isHighConfidence) {
            return { confidence: 'high', reasons };
        }

        const isMediumConfidence =
            ((context.exactNameMatch || (context.surnameDistance <= 1 && context.nameDistance <= 1)) && context.sameBirthYear) ||
            ((context.exactNameMatch || (context.surnameDistance <= 1 && context.nameDistance <= 1)) && context.sameCity) ||
            (context.exactNameMatch && !source.dob && !candidate.dob);

        if (!isMediumConfidence) {
            return null;
        }

        return { confidence: 'medium', reasons };
    }

    private buildDuplicateContext(
        source: Partial<Patient>,
        candidate: Patient,
        sourceName: string,
        sourceSurname: string,
        candidateName: string,
        candidateSurname: string
    ): DuplicateMatchContext {
        const sourceBirthYear = this.getBirthYear(source.dob);
        const candidateBirthYear = this.getBirthYear(candidate.dob);

        return {
            exactNameMatch: sourceName === candidateName && sourceSurname === candidateSurname,
            sameDob: !!source.dob && !!candidate.dob && source.dob === candidate.dob,
            sameBirthYear: !!sourceBirthYear && !!candidateBirthYear && Math.abs(sourceBirthYear - candidateBirthYear) <= 1,
            sameCity: this.normalizeStr(source.city || '') !== '' && this.normalizeStr(source.city || '') === this.normalizeStr(candidate.city || ''),
            surnameDistance: this.levenshtein(sourceSurname, candidateSurname),
            nameDistance: this.levenshtein(sourceName, candidateName)
        };
    }

    private buildMergedPatient(survivor: Patient, duplicates: Patient[], resolvedPatient: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>): Patient {
        const allPatients = [survivor, ...duplicates];

        return {
            ...survivor,
            name: toTitleCase((resolvedPatient.name ?? this.pickPreferredValue(allPatients.map(patient => patient.name))) || survivor.name),
            surname: toTitleCase((resolvedPatient.surname ?? this.pickPreferredValue(allPatients.map(patient => patient.surname))) || survivor.surname),
            dob: resolvedPatient.dob ?? this.pickPreferredValue(allPatients.map(patient => patient.dob)),
            phone_number: resolvedPatient.phone_number ?? this.pickPreferredValue(allPatients.map(patient => patient.phone_number)),
            street: resolvedPatient.street ?? this.pickPreferredValue(allPatients.map(patient => patient.street)),
            city: resolvedPatient.city ?? this.pickPreferredValue(allPatients.map(patient => patient.city)),
            oph_ants: resolvedPatient.oph_ants ?? this.mergeTextValues(allPatients.map(patient => patient.oph_ants)),
            gen_ants: resolvedPatient.gen_ants ?? this.mergeTextValues(allPatients.map(patient => patient.gen_ants))
        };
    }

    private pickPreferredValue(values: Array<string | null | undefined>): string | null {
        for (const value of values) {
            if (value && value.trim()) return value.trim();
        }

        return null;
    }

    private mergeTextValues(values: Array<string | null | undefined>): string | null {
        const unique = Array.from(
            new Map(
                values
                    .filter((value): value is string => !!value && !!value.trim())
                    .map(value => [value.trim().toLowerCase(), value.trim()])
            ).values()
        );

        return unique.length > 0 ? unique.join('\n\n') : null;
    }

    private tableHasColumn(tableName: string, columnName: string): boolean {
        const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
        return columns.some(column => column.name === columnName);
    }

    private getBirthYear(dob?: string | null): number | null {
        if (!dob) return null;

        const date = new Date(dob);
        return Number.isNaN(date.getTime()) ? null : date.getFullYear();
    }

    private normalizeStr(value: string): string {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');
    }

    private levenshtein(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = Array.from({ length: b.length + 1 }, () => Array(a.length + 1).fill(0));

        for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= b.length; j++) {
            for (let i = 1; i <= a.length; i++) {
                const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }

        return matrix[b.length][a.length];
    }

    private mapRow(row: any): Patient {
        return {
            ...row,
            name: toTitleCase(row.name),
            surname: toTitleCase(row.surname)
        };
    }
}
