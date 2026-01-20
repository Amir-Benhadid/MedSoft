/**
 * Conversion Repository
 * 
 * Provides database operations for converting lens prescriptions between
 * glasses (lunettes) and contact lenses (lentilles) using conversion tables.
 */

import { getDatabase } from '../database.js';

export interface LentilleConversion {
    id: string;
    num_enr: string;
    idtab_conversion: string;
    lunettes: number;
    lun_plus: number;
    lun_moins: number;
}

/**
 * Repository for lens prescription conversions.
 */
export class ConversionRepository {
    /**
     * Finds the closest conversion for a given sphere value.
     * Rounds to nearest 0.25 and searches for exact or nearest match.
     *
     * @param sphere - Sphere value to convert
     * @returns Closest conversion match or null if not found
     */
    getConversionForSphere(sphere: number): LentilleConversion | null {
        const db = getDatabase();
        const roundedSphere = Math.round(Math.abs(sphere) * 4) / 4;

        const exactMatch = db.prepare('SELECT * FROM lentille_conv WHERE lunettes = ?').get(roundedSphere) as LentilleConversion | undefined;

        if (exactMatch) {
            return exactMatch;
        }

        const candidates = db.prepare(`
            SELECT * FROM lentille_conv 
            WHERE lunettes BETWEEN ? AND ?
            ORDER BY lunettes ASC
        `).all(roundedSphere - 0.5, roundedSphere + 0.5) as LentilleConversion[];

        if (candidates.length === 0) {
            return null;
        }

        const closest = candidates.reduce((prev, curr) => {
            return Math.abs(curr.lunettes - roundedSphere) < Math.abs(prev.lunettes - roundedSphere)
                ? curr
                : prev;
        });

        return closest;
    }
}

export const conversionRepository = new ConversionRepository();
