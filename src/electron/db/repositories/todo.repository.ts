/**
 * Todo Repository
 * 
 * Provides database operations for managing todo items with priority
 * levels and completion tracking. Supports filtering by completion status.
 */

import { getDatabase } from '../database.js';
import crypto from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface Todo {
    id: string;
    text: string;
    is_completed: boolean;
    priority: 'normal' | 'high';
    created_at: string;
    completed_at: string | null;
    updated_at: string;
}

/**
 * Repository for managing todo items.
 */
export class TodoRepository {
    private db = getDatabase();

    /**
     * Creates a new todo item.
     *
     * @param text - Todo text content
     * @param priority - Priority level (default: 'normal')
     * @returns Created todo item
     */
    create(text: string, priority: 'normal' | 'high' = 'normal'): Todo {
        const id = crypto.randomUUID();
        const created_at = getLocalISOString();
        const updated_at = created_at;

        const stmt = this.db.prepare(`
            INSERT INTO todos (id, text, is_completed, priority, created_at, updated_at)
            VALUES (?, ?, 0, ?, ?, ?)
        `);

        stmt.run(id, text, priority, created_at, updated_at);

        return {
            id,
            text,
            is_completed: false,
            priority,
            created_at,
            completed_at: null,
            updated_at
        };
    }

    /**
     * Lists todo items, optionally including completed ones.
     *
     * @param includeCompleted - Whether to include completed todos (default: false)
     * @returns Array of todo items, ordered by completion status, priority, and creation date
     */
    list(includeCompleted = false): Todo[] {
        const query = includeCompleted
            ? `SELECT * FROM todos ORDER BY is_completed ASC, priority ASC, created_at DESC`
            : `SELECT * FROM todos WHERE is_completed = 0 ORDER BY priority ASC, created_at DESC`;

        const stmt = this.db.prepare(query);
        const rows = stmt.all() as any[];

        return rows.map(row => ({
            ...row,
            is_completed: Boolean(row.is_completed)
        }));
    }

    /**
     * Toggles the completion status of a todo item.
     *
     * @param id - Todo ID
     * @param isCompleted - New completion status
     * @returns True if update was successful, false otherwise
     */
    toggle(id: string, isCompleted: boolean): boolean {
        const updated_at = getLocalISOString();
        const completed_at = isCompleted ? updated_at : null;

        const stmt = this.db.prepare(`
            UPDATE todos 
            SET is_completed = ?, completed_at = ?, updated_at = ?
            WHERE id = ?
        `);

        const result = stmt.run(isCompleted ? 1 : 0, completed_at, updated_at, id);
        return result.changes > 0;
    }

    /**
     * Deletes a todo item by ID.
     *
     * @param id - Todo ID
     * @returns True if deletion was successful, false otherwise
     */
    delete(id: string): boolean {
        const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
