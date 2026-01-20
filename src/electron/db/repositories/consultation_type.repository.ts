/**
 * Consultation Type Repository
 * 
 * Provides database operations for managing consultation types, including
 * labels, pricing, colors, and activation status.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';

export const ConsultationTypeSchema = z.object({
    id: z.number(),
    label: z.string(),
    amount: z.number(),
    color: z.string().optional().default('#3b82f6'),
    is_active: z.number().default(1),
    nature: z.enum(['normal', 'radiography']).optional().default('normal'),
});

export type ConsultationType = z.infer<typeof ConsultationTypeSchema>;

/**
 * Repository for managing consultation types.
 */
export class ConsultationTypeRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Finds all active consultation types, ordered by ID.
     *
     * @returns Array of active consultation types
     */
    findAll(): ConsultationType[] {
        const rows = this.db.prepare(`
            SELECT * FROM consultation_types 
            WHERE is_active = 1
            ORDER BY id ASC
        `).all();
        return rows as ConsultationType[];
    }

    /**
     * Creates a new consultation type.
     *
     * @param data - Consultation type data (without id, is_active, color, nature)
     * @returns Created consultation type with generated ID
     */
    create(data: Omit<ConsultationType, 'id' | 'is_active' | 'color' | 'nature'> & { color?: string, nature?: 'normal' | 'radiography' }): ConsultationType {
        const stmt = this.db.prepare(`
            INSERT INTO consultation_types (label, amount, color, nature)
            VALUES (?, ?, ?, ?)
        `);
        const info = stmt.run(data.label, data.amount, data.color || '#3b82f6', data.nature || 'normal');
        return { ...data, id: Number(info.lastInsertRowid), is_active: 1, color: data.color || '#3b82f6', nature: data.nature || 'normal' };
    }

    /**
     * Updates a consultation type by ID.
     *
     * @param id - Consultation type ID
     * @param data - Partial consultation type data to update
     * @returns Updated consultation type or undefined if no fields to update
     */
    update(id: number, data: Partial<Omit<ConsultationType, 'id'>>): ConsultationType | undefined {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.label !== undefined) { fields.push('label = ?'); values.push(data.label); }
        if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
        if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
        if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active); }
        if (data.nature !== undefined) { fields.push('nature = ?'); values.push(data.nature); }

        if (fields.length === 0) return undefined;

        values.push(id);
        const stmt = this.db.prepare(`UPDATE consultation_types SET ${fields.join(', ')}, updated_at = datetime('now', 'localtime') WHERE id = ?`);
        stmt.run(...values);

        return this.db.prepare('SELECT * FROM consultation_types WHERE id = ?').get(id) as ConsultationType;
    }

    /**
     * Soft deletes a consultation type by setting is_active to 0.
     *
     * @param id - Consultation type ID
     */
    delete(id: number): void {
        const stmt = this.db.prepare('UPDATE consultation_types SET is_active = 0 WHERE id = ?');
        stmt.run(id);
    }
}
