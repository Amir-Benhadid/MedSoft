/**
 * Professional Contacts Repository
 * 
 * Provides database operations for managing professional contacts such as
 * doctors, specialists, and other healthcare providers. Supports search
 * and contact information management.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const ProfessionalContactSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().optional().default('Doctor'),
    specialty: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type ProfessionalContact = z.infer<typeof ProfessionalContactSchema>;

export const CreateProfessionalContactSchema = ProfessionalContactSchema.omit({
    id: true,
    created_at: true,
    updated_at: true
});

/**
 * Repository for managing professional contact data.
 */
export const ProfessionalContactsRepository = {
    /**
     * Finds all professional contacts, ordered by name.
     *
     * @returns Array of all professional contacts
     */
    findAll: () => {
        const db = getDatabase();
        const stmt = db.prepare(`
            SELECT * FROM professional_contacts 
            ORDER BY name ASC 
        `);
        return stmt.all() as ProfessionalContact[];
    },

    /**
     * Searches professional contacts by name, specialty, or type.
     *
     * @param query - Search query string
     * @returns Array of matching professional contacts
     */
    search: (query: string) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            SELECT * FROM professional_contacts 
            WHERE name LIKE ? OR specialty LIKE ? OR type LIKE ?
            ORDER BY name ASC
        `);
        const searchPattern = `%${query}%`;
        return stmt.all(searchPattern, searchPattern, searchPattern) as ProfessionalContact[];
    },

    /**
     * Creates a new professional contact.
     *
     * @param data - Professional contact data
     * @returns Created professional contact
     */
    create: (data: z.infer<typeof CreateProfessionalContactSchema>) => {
        const db = getDatabase();
        const id = randomUUID();
        const stmt = db.prepare(`
            INSERT INTO professional_contacts (
                id, name, type, specialty, address, phone, email, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            data.name,
            data.type || 'Doctor',
            data.specialty || null,
            data.address || null,
            data.phone || null,
            data.email || null,
            data.notes || null
        );

        return ProfessionalContactsRepository.findById(id);
    },

    /**
     * Finds a professional contact by ID.
     *
     * @param id - Contact ID
     * @returns Professional contact or undefined if not found
     */
    findById: (id: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM professional_contacts WHERE id = ?');
        return stmt.get(id) as ProfessionalContact | undefined;
    },

    /**
     * Updates a professional contact by ID.
     *
     * @param id - Contact ID
     * @param data - Partial contact data to update
     * @returns Updated professional contact
     */
    update: (id: string, data: Partial<z.infer<typeof CreateProfessionalContactSchema>>) => {
        const db = getDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
        if (data.specialty !== undefined) { fields.push('specialty = ?'); values.push(data.specialty); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
        if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

        if (fields.length === 0) return ProfessionalContactsRepository.findById(id);

        values.push(id);

        const stmt = db.prepare(`UPDATE professional_contacts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
        stmt.run(...values);

        return ProfessionalContactsRepository.findById(id);
    },

    /**
     * Deletes a professional contact by ID.
     *
     * @param id - Contact ID
     * @returns Success indicator
     */
    delete: (id: string) => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM professional_contacts WHERE id = ?');
        stmt.run(id);
        return { success: true };
    }
};
