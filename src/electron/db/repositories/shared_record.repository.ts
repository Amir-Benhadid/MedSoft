import { getDatabase } from '../database.js';
import crypto from 'crypto';
import { getLocalISOString } from '../../lib/time.js';

export interface SharedRecord {
    id: string;
    patient_id: string;
    sender: 'DOCTOR' | 'SECRETARY';
    receiver: 'DOCTOR' | 'SECRETARY';
    status: 'unread' | 'read' | 'archived';
    created_at: string;
    updated_at: string;
    // Joined fields
    patient_name?: string;
    patient_surname?: string;
    patient_dob?: string;
}

export class SharedRecordRepository {
    private db = getDatabase();

    create(patientId: string, sender: 'DOCTOR' | 'SECRETARY', receiver: 'DOCTOR' | 'SECRETARY'): SharedRecord {
        const id = crypto.randomUUID();
        const now = getLocalISOString();

        const stmt = this.db.prepare(`
            INSERT INTO shared_records (id, patient_id, sender, receiver, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'unread', ?, ?)
        `);

        stmt.run(id, patientId, sender, receiver, now, now);

        return {
            id,
            patient_id: patientId,
            sender,
            receiver,
            status: 'unread',
            created_at: now,
            updated_at: now
        };
    }

    list(receiver: 'DOCTOR' | 'SECRETARY', limit = 50): SharedRecord[] {
        const stmt = this.db.prepare(`
            SELECT sr.*, p.name as patient_name, p.surname as patient_surname, p.dob as patient_dob
            FROM shared_records sr
            JOIN patients p ON sr.patient_id = p.id
            WHERE sr.receiver = ?
            ORDER BY sr.created_at DESC
            LIMIT ?
        `);

        return stmt.all(receiver, limit) as SharedRecord[];
    }

    countUnread(receiver: 'DOCTOR' | 'SECRETARY'): number {
        const stmt = this.db.prepare(`
            SELECT count(*) as count
            FROM shared_records
            WHERE receiver = ? AND status = 'unread'
        `);
        const result = stmt.get(receiver) as { count: number };
        return result.count;
    }

    markAsRead(ids: string[]): boolean {
        if (ids.length === 0) return true;
        const placeholders = ids.map(() => '?').join(',');
        const stmt = this.db.prepare(`
            UPDATE shared_records SET status = 'read', updated_at = ?
            WHERE id IN (${placeholders})
        `);
        const now = getLocalISOString();
        const info = stmt.run(now, ...ids);
        return info.changes > 0;
    }

    delete(id: string): boolean {
        const stmt = this.db.prepare('DELETE FROM shared_records WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0;
    }
}
