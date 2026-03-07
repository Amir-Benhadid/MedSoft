/**
 * Invoice Repository
 * 
 * Provides database operations for managing invoices related to consultations.
 * Handles payment tracking, invoice creation, and payment status updates.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';
import { getLocalISOString } from '../../lib/time.js';

export const InvoiceSchema = z.object({
    id: z.string(),
    consultation_id: z.string(),
    patient_id: z.string().nullable().optional(), // Added for direct linkage
    amount: z.number(),
    total: z.number(),
    paid: z.number(),
    type: z.string().nullable(),
    method: z.string().nullable().optional(),
    consultation_type_id: z.number().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * Repository for managing invoice data.
 */
export class InvoiceRepository {
    private get db() {
        return getDatabase();
    }

    constructor() {
        this.ensureTableExists();
    }

    /**
     * Ensures the invoices table exists (fallback check).
     * Primary schema management is handled by database.ts migrations.
     */
    private ensureTableExists() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                consultation_id TEXT NOT NULL,
                patient_id TEXT,
                amount REAL NOT NULL,
                total REAL NOT NULL,
                paid REAL NOT NULL,
                type TEXT NOT NULL,
                method TEXT DEFAULT 'cash',
                consultation_type_id INTEGER,
                created_at TEXT,
                updated_at TEXT,
                FOREIGN KEY (consultation_id) REFERENCES consultations(id)
            )
        `);
    }

    /**
     * Finds an invoice by consultation ID.
     *
     * @param consultationId - Consultation ID
     * @returns Invoice or null if not found
     */
    findByConsultationId(consultationId: string): Invoice | null {
        const row = this.db.prepare('SELECT * FROM invoices WHERE consultation_id = ?').get(consultationId);
        if (!row) return null;
        return InvoiceSchema.parse(row);
    }

    /**
     * Finds an invoice by ID.
     *
     * @param id - Invoice ID
     * @returns Invoice or null if not found
     */
    findById(id: string): Invoice | null {
        const row = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
        if (!row) return null;
        return InvoiceSchema.parse(row);
    }

    /**
     * Finds invoices by Patient ID.
     *
     * @param patientId - Patient ID
     * @returns Array of Invoices
     */
    findByPatientId(patientId: string): Invoice[] {
        // Find all invoices linked to this patient's consultations, or directly on the invoice
        const rows = this.db.prepare(`
            SELECT DISTINCT i.* 
            FROM invoices i 
            LEFT JOIN consultations c ON i.consultation_id = c.id 
            WHERE i.patient_id = ? OR c.patient_id = ?
            ORDER BY i.created_at DESC
        `).all(patientId, patientId);
        return rows.map(r => InvoiceSchema.parse(r));
    }

    /**
     * Updates an invoice by ID.
     *
     * @param id - Invoice ID
     * @param updates - Partial invoice data to update
     * @returns True if update was successful, false otherwise
     */
    update(id: string, updates: Partial<Invoice>): boolean {
        const sets: string[] = [];
        const values: any[] = [];
        const now = getLocalISOString();

        if (updates.paid !== undefined) { sets.push('paid = ?'); values.push(updates.paid); }
        if (updates.method) { sets.push('method = ?'); values.push(updates.method); }
        if (updates.patient_id !== undefined) { sets.push('patient_id = ?'); values.push(updates.patient_id); }

        sets.push('updated_at = ?');
        values.push(now);

        const query = `UPDATE invoices SET ${sets.join(', ')} WHERE id = ?`;
        values.push(id);

        try {
            const info = this.db.prepare(query).run(...values);
            return info.changes > 0;
        } catch (error) {
            console.error('Failed to update invoice:', error);
            return false;
        }
    }

    /**
     * Marks an invoice as fully paid.
     *
     * @param id - Invoice ID
     * @returns True if update was successful, false if invoice not found
     */
    markAsPaid(id: string): boolean {
        const invoice = this.findById(id);
        if (!invoice) return false;
        return this.update(id, { paid: invoice.total });
    }

    /**
     * Counts invoices with pending payments (paid < total).
     *
     * @returns Number of pending invoices
     */
    countPending(): number {
        const result = this.db.prepare('SELECT COUNT(*) as count FROM invoices WHERE paid < total').get() as { count: number };
        return result.count;
    }
}
