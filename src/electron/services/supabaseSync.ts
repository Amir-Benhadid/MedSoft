/**
 * Supabase Synchronization Service
 * 
 * Syncs data from Supabase to the local SQLite database.
 * Handles patient deduplication, data normalization, and relationship mapping.
 */

import { createClient } from '@supabase/supabase-js';
import { getDatabase } from '../db/database.js';
import type { Database } from 'better-sqlite3';

/**
 * Synchronizes data from Supabase to the local database.
 * 
 * Fetches patients, appointments, consultations, invoices, and waitlist entries from Supabase,
 * performs intelligent deduplication using fuzzy matching, and inserts the data into the local database.
 * Handles patient ID mapping for related records.
 *
 * @param url - The Supabase project URL
 * @param key - The Supabase anonymous/public key
 * @returns Promise resolving to sync result with success status, message, and statistics
 */
export async function syncFromSupabase(url: string, key: string): Promise<{ success: boolean; message: string; stats?: any }> {
    console.log('🔄 Starting Supabase Sync...');

    try {
        const supabase = createClient(url, key);
        const db = getDatabase();

        const tables = ['patients', 'appointments', 'consultations', 'invoices', 'waitlist_entries'];
        const data: Record<string, any[]> = {};

        for (const table of tables) {
            console.log(`📥 Fetching ${table}...`);
            let allRows: any[] = [];
            let page = 0;
            const pageSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data: rows, error } = await supabase
                    .from(table)
                    .select('*')
                    .range(page * pageSize, (page + 1) * pageSize - 1);

                if (error) throw new Error(`Error fetching ${table}: ${error.message}`);

                if (rows && rows.length > 0) {
                    allRows = allRows.concat(rows);
                    if (rows.length < pageSize) hasMore = false;
                    else page++;
                } else {
                    hasMore = false;
                }
            }
            data[table] = allRows;
        }

        console.log('💾 Inserting data into local DB...');

        const safeStringify = (obj: any) => obj ? JSON.stringify(obj) : null;

        /**
         * Converts a string to title case.
         */
        const toTitleCase = (str: string) => {
            if (!str) return '';
            return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        };

        /**
         * Normalizes a string for comparison (trim, lowercase, collapse whitespace).
         */
        const normalizeStr = (str: string) => {
            if (!str) return '';
            return str.trim().toLowerCase().replace(/\s+/g, ' ');
        };

        /**
         * Calculates Levenshtein distance between two strings.
         * Used for fuzzy matching of patient names.
         */
        const levenshtein = (s1: string, s2: string): number => {
            const a = s1 || '';
            const b = s2 || '';
            if (a.length === 0) return b.length;
            if (b.length === 0) return a.length;

            const matrix = [];

            // increment along the first column of each row
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }

            // increment each column in the first row
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }

            // Fill in the rest of the matrix
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1, // substitution
                            Math.min(
                                matrix[i][j - 1] + 1, // insertion
                                matrix[i - 1][j] + 1 // deletion
                            )
                        );
                    }
                }
            }

            return matrix[b.length][a.length];
        };

        /**
         * Extracts birth year from date of birth string or calculates from age.
         */
        const getBirthYear = (dob: string | null, age: number | null): number | null => {
            if (dob) {
                const d = new Date(dob);
                if (!isNaN(d.getFullYear())) return d.getFullYear();
            }
            if (age !== null && age !== undefined) {
                return new Date().getFullYear() - age;
            }
            return null;
        };

        const seedProcessedIds = new Set<string>();
        const idMap = new Map<string, string>();

        console.log('🔍 Indexing existing patients...');
        interface PatientParams {
            id: string;
            normName: string;
            normSurname: string;
            birthYear: number | null;
            originalName: string; // for potential logging
            originalSurname: string;
        }

        const existingPatientsRows = db.prepare('SELECT id, name, surname, dob FROM patients').all() as { id: string, name: string, surname: string, dob: string }[];

        const localPatientsIndex: Record<string, PatientParams[]> = {};

        const addToIndex = (p: PatientParams) => {
            const key = p.normSurname.slice(0, 1);
            if (!localPatientsIndex[key]) localPatientsIndex[key] = [];
            localPatientsIndex[key].push(p);
        };

        for (const p of existingPatientsRows) {
            addToIndex({
                id: p.id,
                normName: normalizeStr(p.name),
                normSurname: normalizeStr(p.surname),
                birthYear: getBirthYear(p.dob, null),
                originalName: p.name,
                originalSurname: p.surname
            });
            seedProcessedIds.add(p.id);
        }

        const findDuplicate = (normName: string, normSurname: string, birthYear: number | null): string | null => {
            const key = normSurname.slice(0, 1);
            const candidates = localPatientsIndex[key] || [];

            for (const candidate of candidates) {
                const surnameDist = (candidate.normSurname === normSurname) ? 0 : levenshtein(candidate.normSurname, normSurname);
                const nameDist = (candidate.normName === normName) ? 0 : levenshtein(candidate.normName, normName);

                if (normSurname.length < 3 && surnameDist > 0) continue;
                if (normName.length < 3 && nameDist > 0) continue;

                if (surnameDist <= 2 && nameDist <= 2) {
                    if (birthYear && candidate.birthYear) {
                        if (Math.abs(birthYear - candidate.birthYear) <= 1) {
                            return candidate.id;
                        }
                    } else if (!birthYear || !candidate.birthYear) {
                        if (surnameDist <= 1 && nameDist <= 1) {
                            return candidate.id;
                        }
                    }
                }
            }
            return null;
        };

        // --- PROCESSING PATIENTS ---

        db.transaction(() => {
            const insertPatient = db.prepare(`
                INSERT OR IGNORE INTO patients (id, name, surname, dob, phone_number, street, city, gen_ants, created_at, updated_at)
                VALUES (@id, @name, @surname, @dob, @phone_number, @street, @city, @gen_ants, @created_at, @updated_at)
            `);

            let duplicatesCount = 0;
            let newPatientsCount = 0;

            const sbPatients = data['patients'] || [];

            for (const p of sbPatients) {
                const normName = normalizeStr(p.name);
                const normSurname = normalizeStr(p.surname);
                // "p.age" might exist in raw data if not in types
                const birthYear = getBirthYear(p.dob, p.age);

                // 1. Check for duplicate
                const duplicateId = findDuplicate(normName, normSurname, birthYear);

                if (duplicateId) {
                    console.log(`⚠️ Duplicate found: Supabase(${p.name} ${p.surname}) overlaps with Local(${duplicateId}). Mapping ID.`);
                    idMap.set(p.id, duplicateId);
                    duplicatesCount++;
                    continue; // Skip Insert
                }

                // 2. Normalization for Insert
                const finalName = toTitleCase(p.name);
                const finalSurname = toTitleCase(p.surname);
                const finalCity = p.address ? toTitleCase(p.address.city || '') : '';

                // 3. Insert
                insertPatient.run({
                    id: p.id,
                    name: finalName,
                    surname: finalSurname,
                    dob: p.dob, // Keep original DOB string if present
                    phone_number: p.phone_number || p.phone,
                    street: p.address ? (p.address.street || '') : '',
                    city: finalCity,
                    gen_ants: p.medical_history,
                    created_at: p.created_at,
                    updated_at: p.updated_at
                });

                seedProcessedIds.add(p.id);
                newPatientsCount++;

                addToIndex({
                    id: p.id,
                    normName,
                    normSurname,
                    birthYear,
                    originalName: finalName,
                    originalSurname: finalSurname
                });
            }

            console.log(`✅ Patients Processed: ${newPatientsCount} new, ${duplicatesCount} duplicates merged.`);

            /**
             * Resolves a Supabase patient ID to the local patient ID.
             * Returns mapped ID if duplicate was found, or original ID if patient was inserted.
             */
            const resolvePatientId = (originalId: string): string | null => {
                const mapped = idMap.get(originalId);
                if (mapped) return mapped;
                if (seedProcessedIds.has(originalId)) return originalId; // It was inserted
                // If not mapped and not in seededIds, it might be a patient we failed to fetch or skipped?
                // But we should try to ensure it exists.
                return null;
            };

            /**
             * Ensures a patient ID exists in the database, resolving duplicates.
             * Checks mapped IDs, seeded IDs, and finally queries the database directly.
             */
            const ensurePatient = (id: string): string | null => {
                const resolvedId = resolvePatientId(id);

                if (resolvedId) return resolvedId;

                try {
                    const exists = db.prepare('SELECT 1 FROM patients WHERE id = ?').get(id);
                    if (exists) return id;
                } catch (e) { }

                return null;
            };

            console.log('🧹 Running pre-insertion cleanup...');
            const invoiceMap = new Map<string, any>();
            for (const inv of data['invoices'] || []) {
                invoiceMap.set(inv.consultation_id, inv);
            }

            const consultationsByPatientDay = new Map<string, any[]>();

            for (const c of data['consultations'] || []) {
                const pid = resolvePatientId(c.patient_id);
                // If patient not found, we can't de-duplicate properly by patient, so we skip grouping 
                if (!pid) continue;

                const dateVal = c.date || c.created_at;
                const dateStr = dateVal ? String(dateVal).substring(0, 10) : 'unknown';

                const key = `${pid}_${dateStr}`;
                if (!consultationsByPatientDay.has(key)) {
                    consultationsByPatientDay.set(key, []);
                }
                consultationsByPatientDay.get(key)!.push(c);
            }

            const consIdsToRemove = new Set<string>();

            for (const group of consultationsByPatientDay.values()) {
                if (group.length === 1) {
                    const c = group[0];
                    const inv = invoiceMap.get(c.id);
                    if (inv) {
                        const total = inv.total || inv.amount || inv.base_price || 0;
                        // If it's not fully paid, we force it to be paid
                        if ((inv.paid || 0) < total) {
                            inv.paid = total;
                            console.log(`💰 Marking single consultation ${c.id} as paid.`);
                        }
                    }
                } else {
                    for (const c of group) {
                        const inv = invoiceMap.get(c.id);
                        const total = inv ? (inv.total || inv.amount || inv.base_price || 0) : 0;
                        const paid = inv ? (inv.paid || 0) : 0;
                        const isPaid = paid >= total && total > 0;

                        if (!isPaid) {
                            consIdsToRemove.add(c.id);
                        }
                    }
                }
            }

            if (consIdsToRemove.size > 0) {
                console.log(`Removing ${consIdsToRemove.size} unpaid/duplicate consultations.`);
                data['consultations'] = (data['consultations'] || []).filter(c => !consIdsToRemove.has(c.id));
                data['invoices'] = (data['invoices'] || []).filter(inv => !consIdsToRemove.has(inv.consultation_id));
            }

            // Appointments
            const insertAppointment = db.prepare(`
                INSERT OR IGNORE INTO appointments (id, patient_id, start_time, end_time, arrived_at, title, state, type, notes, created_at, updated_at)
                VALUES (@id, @patient_id, @start_time, @end_time, @arrived_at, @title, @state, @type, @notes, @created_at, @updated_at)
            `);
            for (const a of data['appointments']) {
                const pid = ensurePatient(a.patient_id);
                if (!pid) continue;

                let state = a.state || 'booked';
                if (state === 'paid') state = 'completed';
                if (a.status === 'SCHEDULED' && state === 'booked') state = 'booked';

                insertAppointment.run({
                    id: a.id,
                    patient_id: pid,
                    start_time: a.start_time,
                    end_time: a.end_time,
                    arrived_at: a.arrived_at,
                    title: a.title,
                    state: state,
                    type: 'consultation',
                    notes: a.notes,
                    created_at: a.created_at,
                    updated_at: a.updated_at
                });
            }

            // Waitlist
            const insertWaitlist = db.prepare(`
                INSERT OR IGNORE INTO waitlist_entries (id, patient_id, arrived_at, state, type, notes, created_at, updated_at)
                VALUES (@id, @patient_id, @arrived_at, @state, @type, @notes, @created_at, @updated_at)
            `);
            for (const w of data['waitlist_entries']) {
                const pid = ensurePatient(w.patient_id);
                if (!pid) continue;
                insertWaitlist.run({
                    id: w.id,
                    patient_id: pid,
                    arrived_at: w.arrived_at,
                    state: w.state,
                    type: w.type,
                    notes: w.notes,
                    created_at: w.created_at,
                    updated_at: w.updated_at
                });
            }

            // Consultations
            const insertConsult = db.prepare(`
                INSERT OR IGNORE INTO consultations (id, patient_id, date, type, status, documents_data, prescription, created_at, updated_at)
                VALUES (@id, @patient_id, @date, @type, @status, @documents_data, @prescription, @created_at, @updated_at)
            `);
            const insertEye = db.prepare(`
                INSERT INTO eye_measurements (consultation_id, eye, sph, cyl, axis, add_val, tension, pachymetry, visual_acuity, raw_data)
                VALUES (@consultation_id, @eye, @sph, @cyl, @axis, @add_val, @tension, @pachymetry, @visual_acuity, @raw_data)
            `);
            const insertExam = db.prepare(`
                INSERT INTO clinical_exams (consultation_id, diagnosis, notes, raw_data)
                VALUES (@consultation_id, @diagnosis, @notes, @raw_data)
            `);

            for (const c of data['consultations']) {
                const pid = ensurePatient(c.patient_id);
                if (!pid) continue;

                insertConsult.run({
                    id: c.id,
                    patient_id: pid,
                    date: c.date || c.created_at,
                    type: 'Consultation',
                    status: 'completed',
                    documents_data: safeStringify(c.documents_data || {}),
                    prescription: c.prescription || '{}',
                    created_at: c.created_at,
                    updated_at: c.updated_at
                });

                // Helper for eye data
                const processEye = (eyeData: any, side: 'left' | 'right') => {
                    if (!eyeData) return;
                    insertEye.run({
                        consultation_id: c.id,
                        eye: side,
                        sph: parseFloat(eyeData.sph) || null,
                        cyl: parseFloat(eyeData.cyl) || null,
                        axis: parseFloat(eyeData.axis) || null,
                        add_val: parseFloat(eyeData.add || eyeData.add_val) || null,
                        tension: parseFloat(eyeData.tension) || null,
                        pachymetry: parseFloat(eyeData.pachymetry) || null,
                        visual_acuity: eyeData.visualAcuity || eyeData.visual_acuity || null,
                        raw_data: JSON.stringify(eyeData)
                    });
                };

                processEye(c.left_eye, 'left');
                processEye(c.right_eye, 'right');

                const examData = c.detailed_clinical_exam || {};
                let diagnosis = c.diagnosis || examData.diagnosis || '';
                if (examData.diagnosisOD) diagnosis += "OD: " + examData.diagnosisOD + " ";
                if (examData.diagnosisOG) diagnosis += "OG: " + examData.diagnosisOG + " ";

                insertExam.run({
                    consultation_id: c.id,
                    diagnosis: diagnosis.trim(),
                    notes: c.notes || '',
                    raw_data: JSON.stringify(examData)
                });
            }

            // Invoices
            const insertInvoice = db.prepare(`
                INSERT OR IGNORE INTO invoices (id, consultation_id, patient_id, amount, total, paid, type, method, created_at, updated_at)
                VALUES (@id, @consultation_id, @patient_id, @amount, @total, @paid, @type, @method, @created_at, @updated_at)
            `);

            for (const inv of data['invoices']) {
                let patientId = inv.patient_id;

                if (!patientId) {
                    const c = db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(inv.consultation_id) as any;
                    if (c) patientId = c.patient_id;
                }

                const pid = ensurePatient(patientId);

                const cExists = db.prepare('SELECT 1 FROM consultations WHERE id = ?').get(inv.consultation_id);
                if (!cExists) continue;

                if (!pid) {
                    const c = db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(inv.consultation_id) as any;
                    if (c) patientId = c.patient_id;
                    else continue;
                } else {
                    patientId = pid;
                }

                insertInvoice.run({
                    id: inv.id,
                    consultation_id: inv.consultation_id,
                    patient_id: patientId,
                    amount: inv.base_price || inv.amount || 0,
                    total: inv.total || 0,
                    paid: inv.paid || 0,
                    type: inv.is_free ? 'free' : 'standard',
                    method: 'cash',
                    created_at: inv.created_at,
                    updated_at: inv.created_at || new Date().toISOString()
                });
            }
        })();

        return {
            success: true,
            message: 'Synchronization Complete',
            stats: {
                patients: data['patients'].length,
                appointments: data['appointments'].length
            }
        };

    } catch (error: any) {
        console.error("Supabase Sync Failed:", error);
        return { success: false, message: error.message };
    }
}
