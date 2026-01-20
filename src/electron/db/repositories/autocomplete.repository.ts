/**
 * Autocomplete Repository
 * 
 * Provides database operations for managing autocomplete options used throughout
 * the application. Supports frequency tracking to prioritize commonly used values.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

export const AutocompleteOptionSchema = z.object({
    id: z.string(),
    category: z.string(),
    value: z.string(),
    frequency: z.number().default(0),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export type AutocompleteOption = z.infer<typeof AutocompleteOptionSchema>;

export const CreateAutocompleteOptionSchema = AutocompleteOptionSchema.omit({
    id: true,
    frequency: true,
    created_at: true,
    updated_at: true
});

/**
 * Repository for managing autocomplete options.
 */
export const AutocompleteRepository = {
    /**
     * Finds all autocomplete options for a given category, ordered by frequency and value.
     *
     * @param category - Category name to filter by
     * @returns Array of autocomplete options
     */
    findAllByCategory: (category: string) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            SELECT * FROM autocomplete_options 
            WHERE category = ? 
            ORDER BY frequency DESC, value ASC
        `);
        return stmt.all(category) as AutocompleteOption[];
    },

    /**
     * Finds an autocomplete option by category and value (case-insensitive).
     *
     * @param category - Category name
     * @param value - Option value to search for
     * @returns Autocomplete option or undefined if not found
     */
    findByCategoryAndValue: (category: string, value: string) => {
        const db = getDatabase();
        const stmt = db.prepare(`
            SELECT * FROM autocomplete_options 
            WHERE category = ? AND lower(value) = lower(?)
        `);
        return stmt.get(category, value) as AutocompleteOption | undefined;
    },

    /**
     * Creates a new autocomplete option. Returns existing option if it already exists.
     *
     * @param data - Autocomplete option data
     * @returns Created or existing autocomplete option
     */
    create: (data: z.infer<typeof CreateAutocompleteOptionSchema>) => {
        const db = getDatabase();
        const id = randomUUID();

        const existing = AutocompleteRepository.findByCategoryAndValue(data.category, data.value);
        if (existing) {
            return existing;
        }

        const stmt = db.prepare(`
            INSERT INTO autocomplete_options (id, category, value, frequency)
            VALUES (?, ?, ?, 0)
        `);

        stmt.run(id, data.category, data.value);
        return AutocompleteRepository.findById(id);
    },

    /**
     * Finds an autocomplete option by ID.
     *
     * @param id - Option ID
     * @returns Autocomplete option or undefined if not found
     */
    findById: (id: string) => {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM autocomplete_options WHERE id = ?');
        return stmt.get(id) as AutocompleteOption | undefined;
    },

    /**
     * Increments the frequency counter for an autocomplete option.
     *
     * @param id - Option ID
     */
    incrementFrequency: (id: string) => {
        const db = getDatabase();
        const stmt = db.prepare('UPDATE autocomplete_options SET frequency = frequency + 1 WHERE id = ?');
        stmt.run(id);
    },

    /**
     * Deletes an autocomplete option by ID.
     *
     * @param id - Option ID
     * @returns Success indicator
     */
    delete: (id: string) => {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM autocomplete_options WHERE id = ?');
        stmt.run(id);
        return { success: true };
    },

    /**
     * Updates the value of an autocomplete option.
     *
     * @param id - Option ID
     * @param value - New value
     * @returns Updated autocomplete option
     */
    update: (id: string, value: string) => {
        const db = getDatabase();
        const stmt = db.prepare("UPDATE autocomplete_options SET value = ?, updated_at = datetime('now', 'localtime') WHERE id = ?");
        stmt.run(value, id);
        return AutocompleteRepository.findById(id);
    }
};
