/**
 * Consultation Repository
 * 
 * Provides database operations for managing medical consultations, including
 * eye measurements, clinical exams, prescriptions, and invoices. Handles
 * both full medical mode and secretary mode (where clinical data is skipped).
 */

import { getDatabase, getConfig } from '../database.js';
import {
    ConsultationSchema,
    CreateConsultationSchema,
    EyeDataSchema,
    TonometrieDataSchema,
    DetailedClinicalExamDataSchema,
    PrescriptionDataSchema,
} from '../schemas/consultation.schema.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

type Consultation = z.infer<typeof ConsultationSchema>;
type CreateConsultationInput = z.infer<typeof CreateConsultationSchema>;
type DetailedClinicalExamData = z.infer<typeof DetailedClinicalExamDataSchema>;

/**
 * Repository for managing consultation data and related medical records.
 */
export class ConsultationRepository {
    private get db() {
        return getDatabase();
    }

    constructor() { }

    /**
     * Checks if a table exists in the database.
     *
     * @param tableName - Name of the table to check
     * @returns True if table exists, false otherwise
     */
    private hasTable(tableName: string): boolean {
        const result = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(tableName);
        return !!result;
    }

    /**
     * Maps database eye measurement row to schema format.
     * Merges structured columns with raw JSON data.
     *
     * @param row - Database row containing eye measurement data
     * @returns Mapped eye data object
     */
    private mapEye(row: any): any {
        if (!row) return {};
        const raw = row.raw_data ? JSON.parse(row.raw_data) : {};

        return {
            ...raw,
            sph: row.sph !== null ? String(row.sph) : raw.sph,
            cyl: row.cyl !== null ? String(row.cyl) : raw.cyl,
            axis: row.axis !== null ? String(row.axis) : raw.axis,
            add: row.add_val !== null ? String(row.add_val) : raw.add,
            tension: row.tension !== null ? String(row.tension) : raw.tension,
            pachymetry: row.pachymetry !== null ? String(row.pachymetry) : raw.pachymetry,
            visualAcuity: row.visual_acuity || raw.visualAcuity,
        };
    }

    /**
     * Maps database clinical exam row to schema format.
     *
     * @param row - Database row containing clinical exam data
     * @returns Mapped clinical exam data object
     */
    private mapExam(row: any): any {
        if (!row) return {};
        const raw = row.raw_data ? JSON.parse(row.raw_data) : {};
        return {
            ...raw,
            diagnosis: row.diagnosis || raw.diagnosis,
        };
    }

    /**
     * Maps database rows to a complete consultation object.
     *
     * @param consultationRow - Main consultation row
     * @param leftEyeRow - Left eye measurement row
     * @param rightEyeRow - Right eye measurement row
     * @param examRow - Clinical exam row
     * @returns Complete consultation object
     */
    private mapFromDb(
        consultationRow: any,
        leftEyeRow: any,
        rightEyeRow: any,
        examRow: any
    ): Consultation {
        return {
            id: consultationRow.id,
            patient_id: consultationRow.patient_id,
            date: consultationRow.date,
            type: consultationRow.type,
            status: consultationRow.status as 'pending' | 'completed',
            created_at: consultationRow.created_at,
            updated_at: consultationRow.updated_at,

            left_eye: this.mapEye(leftEyeRow),
            right_eye: this.mapEye(rightEyeRow),

            tonometrie_data: {
                left_eye: {
                    iop: leftEyeRow?.tension ? String(leftEyeRow.tension) : '',
                    pachymetry: leftEyeRow?.pachymetry ? String(leftEyeRow.pachymetry) : '',
                    time: '', corrected_iop: ''
                },
                right_eye: {
                    iop: rightEyeRow?.tension ? String(rightEyeRow.tension) : '',
                    pachymetry: rightEyeRow?.pachymetry ? String(rightEyeRow.pachymetry) : '',
                    time: '', corrected_iop: ''
                }
            },

            clinical_exam: this.mapExam(examRow),

            prescription: consultationRow.prescription
                ? JSON.parse(consultationRow.prescription)
                : { treatments: [], notes: '' },

            documents_data: consultationRow.documents_data
                ? JSON.parse(consultationRow.documents_data)
                : undefined,
        };
    }

    /**
     * Finds all consultations for a patient, ordered by date descending.
     *
     * @param patientId - Patient ID
     * @returns Array of consultations, empty array if table doesn't exist (Secretary Mode)
     */
    findAllByPatientId(patientId: string): Consultation[] {
        if (!this.hasTable('consultations')) {
            return [];
        }

        const consultations = this.db.prepare(`
            SELECT * FROM consultations 
            WHERE patient_id = ? 
            ORDER BY date DESC
        `).all(patientId);

        const hasEyes = this.hasTable('eye_measurements');
        const hasExams = this.hasTable('clinical_exams');

        return consultations.map((row: any) => {
            let left: any, right: any, exam: any;

            if (hasEyes) {
                const eyes = this.db.prepare('SELECT * FROM eye_measurements WHERE consultation_id = ?').all(row.id) as any[];
                left = eyes.find(e => e.eye === 'left');
                right = eyes.find(e => e.eye === 'right');
            }

            if (hasExams) {
                exam = this.db.prepare('SELECT * FROM clinical_exams WHERE consultation_id = ?').get(row.id);
            }

            return this.mapFromDb(row, left, right, exam);
        });
    }

    /**
     * Finds a consultation by ID.
     *
     * @param id - Consultation ID
     * @returns Consultation or null if not found or table doesn't exist
     */
    findById(id: string): Consultation | null {
        if (!this.hasTable('consultations')) {
            return null;
        }

        const row = this.db.prepare('SELECT * FROM consultations WHERE id = ?').get(id) as any;
        if (!row) return null;

        const hasEyes = this.hasTable('eye_measurements');
        const hasExams = this.hasTable('clinical_exams');

        let left: any, right: any, exam: any;

        if (hasEyes) {
            const eyes = this.db.prepare('SELECT * FROM eye_measurements WHERE consultation_id = ?').all(id) as any[];
            left = eyes.find(e => e.eye === 'left');
            right = eyes.find(e => e.eye === 'right');
        }

        if (hasExams) {
            exam = this.db.prepare('SELECT * FROM clinical_exams WHERE consultation_id = ?').get(id);
        }

        return this.mapFromDb(row, left, right, exam);
    }

    /**
     * Creates a new consultation with all related data (eyes, exams, invoices).
     * Handles secretary mode by skipping clinical data creation.
     *
     * @param data - Consultation creation data
     * @returns Created consultation or null if patient doesn't exist
     */
    create(data: CreateConsultationInput): Consultation | null {
        const id = randomUUID();
        const now = getLocalISOString();
        const config = getConfig();
        const isSecretary = config.appMode === 'secretary';
        const hasConsultations = this.hasTable('consultations');

        try {
            const patientExists = this.db.prepare('SELECT 1 FROM patients WHERE id = ?').get(data.patient_id);
            if (!patientExists) {
                console.error(`❌ Attempted to create consultation for non-existent patient: ${data.patient_id}`);
                return null;
            }

            const transaction = this.db.transaction(() => {
                try {
                    // DEFENSIVE: Before creating, check if a pending consultation for this patient already exists today
                    // This prevents double-creation if the frontend query retries rapidly.
                    if (hasConsultations && !isSecretary) {
                        const today = (data.date || now).split('T')[0];
                        const existing = this.db.prepare(`
                            SELECT id FROM consultations 
                            WHERE patient_id = ? AND date LIKE ? AND status = 'pending' AND type = ?
                            LIMIT 1
                        `).get(data.patient_id, `${today}%`, data.type || 'Consultation') as any;

                        if (existing) {
                            console.log(`⚠️ Prevented duplicate consultation creation for ${data.patient_id}. Returning existing: ${existing.id}`);
                            return existing.id; // Corrected: Transaction should return the ID for the caller to fetch
                        }

                        this.db.prepare(`
                            INSERT INTO consultations (
                                id, patient_id, date, type, status,
                                documents_data, prescription,
                                created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                            id,
                            data.patient_id,
                            data.date,
                            data.type || 'Consultation',
                            data.status || 'pending',
                            data.documents_data ? JSON.stringify(data.documents_data) : null,
                            JSON.stringify(data.prescription || {}),
                            now,
                            now
                        );

                        if (this.hasTable('eye_measurements')) {
                            const insertEye = this.db.prepare(`
                                INSERT INTO eye_measurements (
                                    consultation_id, eye, 
                                    sph, cyl, axis, add_val, 
                                    tension, pachymetry, 
                                    visual_acuity, raw_data
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            `);

                            const processEye = (eyeData: any, eye: 'left' | 'right') => {
                                const raw = eyeData || {};
                                insertEye.run(
                                    id,
                                    eye,
                                    parseFloat(raw.sph) || null,
                                    parseFloat(raw.cyl) || null,
                                    parseFloat(raw.axis) || null,
                                    parseFloat(raw.add) || null,
                                    parseFloat(raw.tension) || null,
                                    parseFloat(raw.pachymetry) || null,
                                    raw.visualAcuity || null,
                                    JSON.stringify(raw)
                                );
                            };

                            processEye(data.left_eye, 'left');
                            processEye(data.right_eye, 'right');
                        }

                        if (this.hasTable('clinical_exams')) {
                            const patientRow = this.db.prepare('SELECT gen_ants, oph_ants FROM patients WHERE id = ?').get(data.patient_id) as any;
                            const examData = data.clinical_exam || ({} as any);

                            if (!examData.generalMedicalHistory && patientRow?.gen_ants) {
                                examData.generalMedicalHistory = patientRow.gen_ants;
                            }
                            if (!examData.ophthalmologicalHistory && patientRow?.oph_ants) {
                                examData.ophthalmologicalHistory = patientRow.oph_ants;
                            }

                            this.db.prepare(`
                                INSERT INTO clinical_exams (
                                    consultation_id, diagnosis, notes, raw_data
                                ) VALUES (?, ?, ?, ?)
                            `).run(
                                id,
                                examData.diagnosis || '',
                                '',
                                JSON.stringify(examData)
                            );
                        }
                    } else {
                        console.log('🔒 Secretary Mode or No Table: Skipping Consultation/ Clinical Data creation.');
                    }

                    if (data.payment) {
                        const invoiceId = randomUUID();
                        const isGratuit = data.payment.amount === 0;
                        const paidAmount = 0; // Keeping legacy behavior

                        this.db.prepare(`
                            INSERT INTO invoices (
                                id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                            invoiceId, id, data.patient_id, data.payment.amount, data.payment.amount, paidAmount,
                            data.payment.type, data.payment.method || 'cash', data.payment.consultation_type_id || null,
                            now, now
                        );
                    } else {
                        const today = now.split('T')[0];
                        let schedulingData = this.db.prepare(`
                            SELECT consultation_type_id FROM appointments 
                            WHERE patient_id = ? AND start_time LIKE ? AND consultation_type_id IS NOT NULL
                            ORDER BY created_at DESC LIMIT 1
                        `).get(data.patient_id, `${today}%`) as any;

                        if (!schedulingData) {
                            schedulingData = this.db.prepare(`
                                SELECT consultation_type_id FROM waitlist_entries 
                                WHERE patient_id = ? AND arrived_at LIKE ? AND consultation_type_id IS NOT NULL
                                ORDER BY created_at DESC LIMIT 1
                            `).get(data.patient_id, `${today}%`) as any;
                        }

                        if (schedulingData && schedulingData.consultation_type_id) {
                            const typeData = this.db.prepare('SELECT amount, label FROM consultation_types WHERE id = ?').get(schedulingData.consultation_type_id) as any;

                            if (typeData) {
                                const invoiceId = randomUUID();
                                const amount = typeData.amount || 0;

                                this.db.prepare(`
                                    INSERT INTO invoices (
                                        id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `).run(
                                    invoiceId, id, data.patient_id, amount, amount, 0,
                                    'standard', 'cash', schedulingData.consultation_type_id,
                                    now, now
                                );
                            }
                        }
                    }

                    if (data.status === 'completed') {
                        const targetState = 'completed';
                        this.db.prepare(`
                            UPDATE appointments SET state = ?, updated_at = ?
                            WHERE patient_id = ? AND state IN ('in_consultation', 'arrived', 'confirmed', 'pending')
                        `).run(targetState, now, data.patient_id);

                        this.db.prepare(`
                            UPDATE waitlist_entries SET state = ?, updated_at = ?
                            WHERE patient_id = ? AND state IN ('in_consultation', 'waiting', 'in_progress')
                        `).run(targetState, now, data.patient_id);
                    }
                } catch (err) {
                    throw err;
                }

                if (!isSecretary) {
                    let oph_ants = data.antecedents?.oph_ants;
                    let gen_ants = data.antecedents?.gen_ants;

                    if (data.clinical_exam) {
                        if (data.clinical_exam.ophthalmologicalHistory !== undefined) {
                            oph_ants = data.clinical_exam.ophthalmologicalHistory;
                        }
                        if (data.clinical_exam.generalMedicalHistory !== undefined) {
                            gen_ants = data.clinical_exam.generalMedicalHistory;
                        }
                    }

                    if (oph_ants !== undefined || gen_ants !== undefined) {
                        this.db.prepare(`
                            UPDATE patients SET 
                                oph_ants = COALESCE(?, oph_ants), 
                                gen_ants = COALESCE(?, gen_ants), 
                                updated_at = ?
                            WHERE id = ?
                        `).run(
                            oph_ants === undefined ? null : oph_ants,
                            gen_ants === undefined ? null : gen_ants,
                            now,
                            data.patient_id
                        );
                    }
                }
                return id;
            });

            const finalId = transaction() as string;
            if (isSecretary) {
                return {
                    id: finalId,
                    patient_id: data.patient_id,
                    date: data.date,
                    type: data.type || 'Consultation',
                    status: data.status as any,
                    created_at: now,
                    updated_at: now,
                    left_eye: EyeDataSchema.parse({}),
                    right_eye: EyeDataSchema.parse({}),
                    tonometrie_data: TonometrieDataSchema.parse({
                        left_eye: { iop: '', pachymetry: '', time: '', corrected_iop: '' },
                        right_eye: { iop: '', pachymetry: '', time: '', corrected_iop: '' }
                    }),
                    clinical_exam: DetailedClinicalExamDataSchema.parse({}),
                    prescription: { treatments: [], notes: '' }
                };
            }
            return this.findById(finalId);
        } catch (error: any) {
            console.error('Failed to create consultation:', error);
            if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
                console.error('❌ Likely cause: Patient ID does not exist in the database (Frontend/Backend mismatch) or Invoice FK failure.');
            }
            return null;
        }
    }

    /**
     * Updates an existing consultation and related data.
     * Handles secretary mode by skipping clinical data updates.
     *
     * @param id - Consultation ID
     * @param updates - Partial consultation data to update
     * @returns True if update was successful, false otherwise
     */
    update(id: string, updates: Partial<CreateConsultationInput>): boolean {
        const now = getLocalISOString();
        const config = getConfig();
        const isSecretary = config.appMode === 'secretary';
        const hasConsultations = this.hasTable('consultations');

        try {
            const transaction = this.db.transaction(() => {
                if (hasConsultations && !isSecretary) {
                    const sets: string[] = [];
                    const values: any[] = [];

                    if (updates.status) { sets.push('status = ?'); values.push(updates.status); }
                    if (updates.type) { sets.push('type = ?'); values.push(updates.type); }
                    if (updates.date) { sets.push('date = ?'); values.push(updates.date); }
                    if (updates.documents_data) { sets.push('documents_data = ?'); values.push(JSON.stringify(updates.documents_data)); }
                    if (updates.prescription) { sets.push('prescription = ?'); values.push(JSON.stringify(updates.prescription)); }

                    if (sets.length > 0) {
                        sets.push('updated_at = ?');
                        values.push(now);
                        values.push(id);
                        this.db.prepare(`UPDATE consultations SET ${sets.join(', ')} WHERE id = ?`).run(...values);
                    }

                    if (this.hasTable('eye_measurements')) {
                        const updateEye = this.db.prepare(`
                            UPDATE eye_measurements SET 
                                sph = COALESCE(?, sph), 
                                cyl = COALESCE(?, cyl), 
                                axis = COALESCE(?, axis), 
                                add_val = COALESCE(?, add_val), 
                                tension = COALESCE(?, tension), 
                                pachymetry = COALESCE(?, pachymetry), 
                                visual_acuity = COALESCE(?, visual_acuity), 
                                raw_data = ?
                            WHERE consultation_id = ? AND eye = ?
                        `);

                        const processUpdateEye = (eyeData: any, eye: 'left' | 'right') => {
                            if (!eyeData) return;
                            const currentEye = this.db.prepare('SELECT raw_data FROM eye_measurements WHERE consultation_id = ? AND eye = ?').get(id, eye) as any;
                            const currentRaw = currentEye ? JSON.parse(currentEye.raw_data) : {};
                            const newRaw = { ...currentRaw, ...eyeData };

                            updateEye.run(
                                parseFloat(eyeData.sph) || null,
                                parseFloat(eyeData.cyl) || null,
                                parseFloat(eyeData.axis) || null,
                                parseFloat(eyeData.add) || null,
                                parseFloat(eyeData.tension) || null,
                                parseFloat(eyeData.pachymetry) || null,
                                eyeData.visualAcuity || null,
                                JSON.stringify(newRaw),
                                id,
                                eye
                            );
                        };

                        if (updates.left_eye) processUpdateEye(updates.left_eye, 'left');
                        if (updates.right_eye) processUpdateEye(updates.right_eye, 'right');
                    }

                    if (updates.clinical_exam && this.hasTable('clinical_exams')) {
                        const currentExam = this.db.prepare('SELECT raw_data FROM clinical_exams WHERE consultation_id = ?').get(id) as any;
                        const currentRaw = currentExam ? JSON.parse(currentExam.raw_data) : {};
                        const newRaw = { ...currentRaw, ...updates.clinical_exam };

                        this.db.prepare(`
                            UPDATE clinical_exams SET 
                                diagnosis = COALESCE(?, diagnosis), 
                                raw_data = ?
                            WHERE consultation_id = ?
                        `).run(
                            updates.clinical_exam.diagnosis || null,
                            JSON.stringify(newRaw),
                            id
                        );
                    }
                }

                if (updates.payment) {
                    const existingInvoice = this.db.prepare('SELECT id, patient_id FROM invoices WHERE consultation_id = ?').get(id) as any;

                    const forceNewInvoice = isSecretary;

                    if (existingInvoice && !forceNewInvoice) {
                        this.db.prepare(`
                            UPDATE invoices SET amount = ?, total = ?, type = ?, consultation_type_id = ?, updated_at = ? 
                            WHERE id = ?
                        `).run(
                            updates.payment.amount,
                            updates.payment.amount,
                            updates.payment.type || null,
                            updates.payment.consultation_type_id || null,
                            now,
                            existingInvoice.id
                        );
                    } else {
                        const invoiceId = randomUUID();
                        let patientId = updates.patient_id;
                        if (!patientId && existingInvoice) {
                            patientId = existingInvoice.patient_id;
                        }
                        if (!patientId && hasConsultations) {
                            const consult = this.db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(id) as any;
                            if (consult) patientId = consult.patient_id;
                        }

                        this.db.prepare(`
                            INSERT INTO invoices (id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                            invoiceId,
                            id,
                            patientId || null,
                            updates.payment.amount,
                            updates.payment.amount,
                            updates.payment.type || null,
                            updates.payment.method || 'cash',
                            updates.payment.consultation_type_id || null,
                            now,
                            now
                        );
                        console.log(`💰 New Invoice Created (Force New: ${forceNewInvoice}) ID: ${invoiceId}`);
                    }
                }

                if (updates.status === 'completed') {
                    let patientId: string | null = null;
                    if (updates.patient_id) {
                        patientId = updates.patient_id;
                    } else if (hasConsultations) {
                        const consult = this.db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(id) as any;
                        if (consult) patientId = consult.patient_id;
                    } else {
                        const inv = this.db.prepare('SELECT patient_id FROM invoices WHERE consultation_id = ? LIMIT 1').get(id) as any;
                        if (inv) patientId = inv.patient_id;
                    }

                    if (patientId) {
                        const targetState = 'completed';
                        this.db.prepare(`
                            UPDATE appointments SET state = ?, updated_at = ?
                            WHERE patient_id = ? AND state IN ('in_consultation', 'present', 'booked')
                         `).run(targetState, now, patientId);

                        this.db.prepare(`
                            UPDATE waitlist_entries SET state = ?, updated_at = ?
                            WHERE patient_id = ? AND state IN ('in_consultation', 'waiting')
                         `).run(targetState, now, patientId);
                    }
                }

                if (!isSecretary) {
                    let oph_ants = updates.antecedents?.oph_ants;
                    let gen_ants = updates.antecedents?.gen_ants;

                    if (updates.clinical_exam) {
                        if (updates.clinical_exam.ophthalmologicalHistory !== undefined) {
                            oph_ants = updates.clinical_exam.ophthalmologicalHistory;
                        }
                        if (updates.clinical_exam.generalMedicalHistory !== undefined) {
                            gen_ants = updates.clinical_exam.generalMedicalHistory;
                        }
                    }

                    if (oph_ants !== undefined || gen_ants !== undefined) {
                        let patientId: string | null = null;
                        if (updates.patient_id) patientId = updates.patient_id;
                        else if (hasConsultations) {
                            const consult = this.db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(id) as any;
                            if (consult) patientId = consult.patient_id;
                        }

                        if (patientId) {
                            this.db.prepare(`
                                UPDATE patients SET 
                                    oph_ants = COALESCE(?, oph_ants), 
                                    gen_ants = COALESCE(?, gen_ants), 
                                    updated_at = ?
                                WHERE id = ?
                            `).run(
                                oph_ants === undefined ? null : oph_ants,
                                gen_ants === undefined ? null : gen_ants,
                                now,
                                patientId
                            );
                        }
                    }
                }
            });

            transaction();
            return true;
        } catch (error) {
            console.error('Failed to update consultation:', error);
            return false;
        }
    }
}
