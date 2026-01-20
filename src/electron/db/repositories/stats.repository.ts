/**
 * Stats Repository
 * 
 * Provides database operations for retrieving statistics and reports,
 * including daily appointment counts, walk-ins, and consultation statistics.
 * Handles both full medical mode and secretary mode.
 */

import { getDatabase } from '../database.js';

/**
 * Repository for retrieving application statistics.
 */
export class StatsRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Gets statistics for today, including appointments, walk-ins, and patients in consultation.
     *
     * @returns Object containing today's statistics
     */
    getTodayStats(): { totalAppointments: number; totalWalkIns: number; patientsInConsultation: number } {
        const now = new Date();
        const startOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const startOfDay = startOfLocalDay.toISOString();
        const endOfDay = endOfLocalDay.toISOString();

        const totalAppointments = this.db.prepare(`
            SELECT COUNT(*) as count FROM appointments
            WHERE start_time >= ? AND start_time <= ?
        `).get(startOfDay, endOfDay) as { count: number };

        const totalWalkIns = this.db.prepare(`
            SELECT COUNT(*) as count FROM waitlist_entries
            WHERE arrived_at >= ? AND arrived_at <= ?
        `).get(startOfDay, endOfDay) as { count: number };

        const appointmentsInConsultation = this.db.prepare(`
            SELECT COUNT(*) as count FROM appointments
            WHERE start_time >= ? AND start_time <= ? AND state = 'in_consultation'
        `).get(startOfDay, endOfDay) as { count: number };

        const waitlistInConsultation = this.db.prepare(`
            SELECT COUNT(*) as count FROM waitlist_entries
            WHERE arrived_at >= ? AND arrived_at <= ? AND state = 'in_consultation'
        `).get(startOfDay, endOfDay) as { count: number };

        return {
            totalAppointments: totalAppointments.count,
            totalWalkIns: totalWalkIns.count,
            patientsInConsultation: appointmentsInConsultation.count + waitlistInConsultation.count
        };
    }

    /**
     * Gets consultation statistics for a date range.
     * Handles both full medical mode (with consultations table) and secretary mode.
     *
     * @param startDate - Start date (YYYY-MM-DD format)
     * @param endDate - End date (YYYY-MM-DD format)
     * @returns Object containing consultations array and summary statistics
     */
    getStats(startDate: string, endDate: string) {
        const start = `${startDate}T00:00:00`;
        const end = `${endDate}T23:59:59`;

        const hasConsultations = !!this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='consultations'").get();

        if (hasConsultations) {
            const rows = this.db.prepare(`
                SELECT 
                    c.id, 
                    c.date,
                    c.type,
                    c.status,
                    p.name as patient_name, 
                    p.surname as patient_surname,
                    i.total as amount,
                    i.paid as paid,
                    i.method as payment_method
                FROM consultations c
                LEFT JOIN patients p ON c.patient_id = p.id
                LEFT JOIN invoices i ON c.id = i.consultation_id
                WHERE c.date >= ? AND c.date <= ?
                ORDER BY c.date DESC
            `).all(start, end) as any[];

            const consultationCount = rows.length;
            const income = rows.reduce((acc, curr) => acc + (curr.paid || 0), 0);
            const totalDue = rows.reduce((acc, curr) => acc + (curr.amount || 0), 0);

            return {
                consultations: rows.map(r => ({
                    id: r.id,
                    date: r.date,
                    patientName: `${r.patient_surname || ''} ${r.patient_name || ''}`.trim() || 'Patient Inconnu',
                    type: r.type,
                    status: r.status,
                    amount: r.amount || 0,
                    paid: r.paid || 0,
                    method: r.payment_method
                })),
                summary: {
                    consultationCount,
                    income,
                    totalDue
                }
            };
        } else {
            const rows = this.db.prepare(`
                SELECT 
                    i.id as invoice_id,
                    i.consultation_id,
                    i.created_at as date,
                    i.type,
                    p.name as patient_name, 
                    p.surname as patient_surname,
                    i.total as amount,
                    i.paid as paid,
                    i.method as payment_method
                FROM invoices i
                LEFT JOIN patients p ON i.patient_id = p.id
                WHERE i.created_at >= ? AND i.created_at <= ?
                ORDER BY i.created_at DESC
            `).all(start, end) as any[];

            const consultationCount = rows.length;
            const income = rows.reduce((acc, curr) => acc + (curr.paid || 0), 0);
            const totalDue = rows.reduce((acc, curr) => acc + (curr.amount || 0), 0);

            return {
                consultations: rows.map(r => ({
                    id: r.consultation_id, // Simulate consultation ID
                    date: r.date,
                    patientName: `${r.patient_surname || ''} ${r.patient_name || ''}`.trim() || 'Patient Inconnu',
                    type: r.type || 'Paiement',
                    status: 'completed',
                    amount: r.amount || 0,
                    paid: r.paid || 0,
                    method: r.payment_method
                })),
                summary: {
                    consultationCount,
                    income,
                    totalDue
                }
            };
        }
    }
}
