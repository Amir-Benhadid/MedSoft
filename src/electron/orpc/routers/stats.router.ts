/**
 * Stats Router
 * 
 * Provides ORPC endpoints for retrieving application statistics, including
 * today's appointment and walk-in counts, and consultation statistics for date ranges.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { StatsRepository } from '../../db/repositories/stats.repository.js';

export const statsRouter = os.router({
    /**
     * Gets statistics for today.
     *
     * @returns Object containing today's appointment counts, walk-ins, and patients in consultation
     */
    getTodayStats: os
        .output(
            z.object({
                totalAppointments: z.number(),
                totalWalkIns: z.number(),
                patientsInConsultation: z.number(),
            })
        )
        .handler(async () => {
            const repo = new StatsRepository();
            return repo.getTodayStats();
        }),

    /**
     * Gets consultation statistics for a date range.
     *
     * @param input.startDate - Start date in YYYY-MM-DD format
     * @param input.endDate - End date in YYYY-MM-DD format
     * @returns Object containing consultations array and summary statistics
     */
    getStats: os
        .input(
            z.object({
                startDate: z.string(),
                endDate: z.string(),
            })
        )
        .output(
            z.object({
                consultations: z.array(
                    z.object({
                        id: z.string(),
                        date: z.string(),
                        patientName: z.string(),
                        type: z.string().nullable().optional(),
                        status: z.string().nullable().optional(),
                        amount: z.number(),
                        paid: z.number(),
                        method: z.string().nullable().optional(),
                    })
                ),
                summary: z.object({
                    consultationCount: z.number(),
                    income: z.number(),
                    totalDue: z.number(),
                })
            })
        )
        .handler(async ({ input }) => {
            const repo = new StatsRepository();
            return repo.getStats(input.startDate, input.endDate);
        }),
});
