/**
 * Medication Repository
 * 
 * Provides database operations for managing medication/medicine records.
 * Supports search, creation, updates, and deletion of medication entries.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const MedicineSchema = z.object({
  id: z.string(),
  medication_name: z.string(),
  strength: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  packaging: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Medicine = z.infer<typeof MedicineSchema>;

export const CreateMedicineSchema = MedicineSchema.omit({
  id: true,
  created_at: true,
  updated_at: true
});

/**
 * Repository for managing medication data.
 */
export const MedicationRepository = {
  /**
   * Finds all medications with pagination support.
   *
   * @param limit - Maximum number of results (default: 50)
   * @param offset - Number of results to skip (default: 0)
   * @returns Array of medications
   */
  findAll: (limit = 50, offset = 0) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM medicines 
      ORDER BY medication_name ASC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Medicine[];
  },

  /**
   * Searches medications by name, prioritizing exact matches.
   *
   * @param query - Search query string
   * @param limit - Maximum number of results (default: 20)
   * @returns Array of matching medications
   */
  search: (query: string, limit = 20) => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM medicines 
      WHERE medication_name LIKE ? 
      ORDER BY 
        CASE 
          WHEN medication_name LIKE ? THEN 1 
          ELSE 2 
        END,
        medication_name ASC
      LIMIT ?
    `);
    const searchPattern = `%${query}%`;
    const exactStartPattern = `${query}%`;
    return stmt.all(searchPattern, exactStartPattern, limit) as Medicine[];
  },

  /**
   * Creates a new medication entry.
   *
   * @param data - Medication data
   * @returns Created medication
   */
  create: (data: z.infer<typeof CreateMedicineSchema>) => {
    const db = getDatabase();
    const id = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO medicines (
        id, medication_name, strength, type, packaging, instructions, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.medication_name,
      data.strength || null,
      data.type || null,
      data.packaging || null,
      data.instructions || null,
      data.category || null
    );

    return MedicationRepository.findById(id);
  },

  /**
   * Finds a medication by ID.
   *
   * @param id - Medication ID
   * @returns Medication or undefined if not found
   */
  findById: (id: string) => {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM medicines WHERE id = ?');
    return stmt.get(id) as Medicine | undefined;
  },

  /**
   * Updates a medication by ID.
   *
   * @param id - Medication ID
   * @param data - Partial medication data to update
   * @returns Updated medication
   */
  update: (id: string, data: Partial<z.infer<typeof CreateMedicineSchema>>) => {
    const db = getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (data.medication_name !== undefined) { fields.push('medication_name = ?'); values.push(data.medication_name); }
    if (data.strength !== undefined) { fields.push('strength = ?'); values.push(data.strength); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.packaging !== undefined) { fields.push('packaging = ?'); values.push(data.packaging); }
    if (data.instructions !== undefined) { fields.push('instructions = ?'); values.push(data.instructions); }
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }

    if (fields.length === 0) return MedicationRepository.findById(id);

    values.push(id);

    const stmt = db.prepare(`UPDATE medicines SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values);

    return MedicationRepository.findById(id);
  },

  /**
   * Deletes a medication by ID.
   *
   * @param id - Medication ID
   * @returns Success indicator
   */
  delete: (id: string) => {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM medicines WHERE id = ?');
    stmt.run(id);
    return { success: true };
  }
};
