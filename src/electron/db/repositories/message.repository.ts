/**
 * Message Repository
 * 
 * Provides database operations for managing internal messages within the application.
 * Supports message creation, listing, read status tracking, and unread counts.
 */

import { getDatabase } from '../database.js';
import crypto from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface Message {
    id: string;
    text: string;
    sender: string;
    created_at: string;
    is_read: boolean;
}

/**
 * Repository for managing message data.
 */
export class MessageRepository {
    private db = getDatabase();

    constructor() {
        this.ensureSchema();
    }

    /**
     * Ensures the messages table has the is_read column (migration helper).
     */
    private ensureSchema() {
        try {
            const tableInfo = this.db.prepare("PRAGMA table_info(messages)").all() as any[];
            const columns = tableInfo.map((c) => c.name);
            if (!columns.includes('is_read')) {
                console.log('Migrating messages: adding is_read column');
                this.db.exec('ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0');
            }
        } catch (error) {
            console.warn('Failed to check/migrate messages table schema:', error);
        }
    }

    /**
     * Creates a new message.
     *
     * @param text - Message text content
     * @param sender - Sender identifier
     * @returns Created message
     */
    create(text: string, sender: string): Message {
        const id = crypto.randomUUID();
        const created_at = getLocalISOString();

        const stmt = this.db.prepare(`
            INSERT INTO messages (id, text, sender, created_at, is_read)
            VALUES (?, ?, ?, ?, 0)
        `);

        stmt.run(id, text, sender, created_at);

        return {
            id,
            text,
            sender,
            created_at,
            is_read: false
        };
    }

    /**
     * Lists all messages from today, ordered by creation time.
     *
     * @returns Array of today's messages
     */
    listToday(): Message[] {
        const stmt = this.db.prepare(`
            SELECT * FROM messages 
            WHERE date(created_at) = date('now', 'localtime')
            ORDER BY created_at ASC
        `);

        return stmt.all().map((msg: any) => ({
            ...msg,
            is_read: Boolean(msg.is_read)
        })) as Message[];
    }

    /**
     * Counts unread messages from today for a specific sender.
     *
     * @param senderFilter - Sender identifier to filter by
     * @returns Number of unread messages
     */
    countUnread(senderFilter: string): number {
        const stmt = this.db.prepare(`
            SELECT COUNT(*) as count FROM messages 
            WHERE is_read = 0 AND sender = ? AND date(created_at) = date('now', 'localtime')
        `);
        const result = stmt.get(senderFilter) as { count: number };
        return result.count;
    }

    /**
     * Marks multiple messages as read.
     *
     * @param ids - Array of message IDs to mark as read
     * @returns True if at least one message was updated, false otherwise
     */
    markAsRead(ids: string[]): boolean {
        if (ids.length === 0) return true;

        const placeholders = ids.map(() => '?').join(',');
        const stmt = this.db.prepare(`
            UPDATE messages SET is_read = 1 WHERE id IN (${placeholders})
        `);

        const info = stmt.run(...ids);
        return info.changes > 0;
    }
}
