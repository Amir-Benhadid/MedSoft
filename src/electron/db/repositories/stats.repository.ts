/**
 * Stats Repository
 * 
 * Provides database operations for retrieving statistics and reports,
 * including daily appointment counts, walk-ins, and consultation statistics.
 * Handles both full medical mode and secretary mode.
 */

import { getDatabase, getConfig } from '../database.js';

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
    getTodayStats(): { totalAppointments: number; totalWalkIns: number; patientsInConsultation: number; patientsWaiting: number; totalPresent: number } {
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

        const patientsWaitingAppointments = this.db.prepare(`
            SELECT COUNT(*) as count FROM appointments
            WHERE start_time >= ? AND start_time <= ? AND state = 'present'
        `).get(startOfDay, endOfDay) as { count: number };

        const patientsWaitingWaitlist = this.db.prepare(`
            SELECT COUNT(*) as count FROM waitlist_entries
            WHERE arrived_at >= ? AND arrived_at <= ? AND state = 'waiting'
        `).get(startOfDay, endOfDay) as { count: number };

        const patientsWaiting = patientsWaitingAppointments.count + patientsWaitingWaitlist.count;
        const patientsInConsultation = appointmentsInConsultation.count + waitlistInConsultation.count;

        return {
            totalAppointments: totalAppointments.count, // Total Prévus
            totalWalkIns: totalWalkIns.count,
            patientsInConsultation: patientsInConsultation,
            patientsWaiting: patientsWaiting,
            totalPresent: patientsWaiting + patientsInConsultation
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

        // We use the invoices table as the primary source of truth for the daily resume.
        // This ensures we capture all financial activity, including invoices created without a full consultation record.
        console.log('[StatsRepository:getStats] Querying INVOICES for range:', start, endDate);
        const rows = this.db.prepare(`
            SELECT 
                i.id as invoice_id,
                i.consultation_id,
                i.created_at as created_at,
                i.type,
                p.name as patient_name, 
                p.surname as patient_surname,
                i.total as amount,
                i.paid as paid,
                i.method as payment_method,
                c.status as consultation_status
            FROM invoices i
            LEFT JOIN patients p ON i.patient_id = p.id
            LEFT JOIN consultations c ON i.consultation_id = c.id
            WHERE i.created_at >= ? AND i.created_at <= ?
            ORDER BY i.created_at DESC
        `).all(start, end) as any[];
        console.log(`[StatsRepository:getStats] Found ${rows.length} invoices/records.`);

        const consultationCount = rows.length;
        const income = rows.reduce((acc, curr) => acc + (curr.paid || 0), 0);
        const totalDue = rows.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        return {
            consultations: rows.map(r => ({
                id: r.consultation_id || r.invoice_id,
                date: r.created_at,
                patientName: `${r.patient_surname || ''} ${r.patient_name || ''}`.trim() || 'Patient Inconnu',
                type: r.type || 'Consultation',
                status: r.consultation_status || 'completed',
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
