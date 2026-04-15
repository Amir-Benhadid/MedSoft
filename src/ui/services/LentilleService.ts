/**
 * Lens Conversion Service
 * 
 * Provides functionality for converting spectacle prescriptions to contact lens
 * prescriptions, including sphere conversion lookups and cylinder adjustments
 * based on medical conversion tables.
 */

import { orpcClient } from '../lib/orpc/client';

/**
 * Lens conversion data from the conversion table
 */
export interface LentilleConversion {
    id: string;
    num_enr: string;
    idtab_conversion: string;
    lunettes: number;
    lun_plus: number;
    lun_moins: number;
}

/**
 * Service class for lens conversion operations
 */
export class LentilleService {
    private conversions: LentilleConversion[] | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Preloads conversion data in the background. Call early (e.g. when Documents view mounts)
     * to avoid delay on first conversion.
     */
    public preload(): void {
        this.ensureInitialized();
    }

    /**
     * Initializes the service by fetching all conversion data.
     * Safe to call multiple times.
     */
    private async ensureInitialized(): Promise<void> {
        if (this.conversions) return;

        if (!this.initPromise) {
            this.initPromise = (async () => {
                try {
                    this.conversions = await orpcClient.conversion.getAll();
                } catch (error) {
                    console.error('[LentilleService] Failed to load conversions:', error);
                    this.conversions = []; // Fallback to empty to prevent infinite retries/errors
                } finally {
                    this.initPromise = null;
                }
            })();
        }

        await this.initPromise;
    }

    /**
     * Finds the nearest inferior conversion record for a given sphere value from the local cache.
     * Logic: Find the record with the largest 'lunettes' value that is <= |sphere|.
     */
    public async getConversionForSphere(sphere: number): Promise<LentilleConversion | null> {
        await this.ensureInitialized();

        if (!this.conversions || this.conversions.length === 0) {
            return null;
        }

        const absSphere = Math.abs(sphere);

        let bestMatch: LentilleConversion | null = null;

        // Assuming conversions are sorted by lunettes ASC (enforced by SQL ORDER BY)
        for (const record of this.conversions) {
            if (record.lunettes <= absSphere) {
                bestMatch = record;
            } else {
                // Once we encounter a value larger than absSphere, we stop.
                // The previous record (bestMatch) is the "nearest inferior".
                break;
            }
        }

        // If absSphere is smaller than the smallest limit in the table (e.g. 0.5 vs start at 4.00),
        // bestMatch will be null.
        return bestMatch;
    }

    /**
     * Converts cylinder value based on medical conversion rules
     * 
     * Conversion rules:
     * - 0: returns 0
     * - 0 < |cyl| <= 1: subtracts 0.25 (preserving sign)
     * - 1 < |cyl| <= 3: subtracts 0.5 (preserving sign)
     * - |cyl| > 3: subtracts 1.0 (preserving sign)
     * 
     * @param {number} cyl - Cylinder value to convert
     * @returns {number} Converted cylinder value
     */
    public convertCylinder(cyl: number): number {
        const absCyl = Math.abs(cyl);
        if (absCyl === 0) return 0;
        if (absCyl > 0 && absCyl <= 1) return cyl - (cyl >= 0 ? 0.25 : -0.25);
        if (absCyl > 1 && absCyl <= 3) return cyl - (cyl >= 0 ? 0.5 : -0.5);
        if (absCyl > 3) return cyl - (cyl >= 0 ? 1 : -1);
        return cyl; // fallback
    }

    /**
     * Converts a complete spectacle prescription to contact lens prescription
     * 
     * Conversion process:
     * 1. Converts sphere value using conversion table
     * 2. Converts (sphere + cylinder) value using conversion table
     * 3. Calculates new cylinder = converted(sphere+cyl) - converted(sphere)
     * 4. Sets new sphere = converted(sphere)
     * 
     * Special case: For "Sphérique" lens type with cylinder > 0:
     * - Converts to spherical equivalent (sphere + 0.5 * cylinder)
     * - Sets cylinder to 0
     * 
     * @param {number} sph - Sphere value
     * @param {number} cyl - Cylinder value
     * @param {number} axis - Axis value (preserved in output)
     * @param {string} lensType - Type of lens ("Sphérique" or other)
     * @returns {Promise<{sphere: number; cylinder: number; axis: number}>} Converted prescription
     */
    public async convertToContactLens(
        sphInput: number | string,
        cylInput: number | string,
        axisInput: number | string,
        lensType: string
    ): Promise<{ sphere: number; cylinder: number; axis: number }> {
        // Normalize inputs - handle strings with commas (e.g. "1,50" -> 1.50)
        const normalize = (val: any): number => {
            if (val === '' || val === undefined || val === null) return 0;
            if (typeof val === 'string') {
                const parsed = parseFloat(val.replace(/,/g, '.'));
                return isNaN(parsed) ? 0 : parsed;
            }
            const parsed = parseFloat(String(val));
            return isNaN(parsed) ? 0 : parsed;
        };

        const sph = normalize(sphInput);
        const cyl = normalize(cylInput);
        const axis = normalize(axisInput);

        try {
            // If any input is invalid, return original (as numbers if possible)
            if (isNaN(sph) || isNaN(cyl) || isNaN(axis)) {
                return {
                    sphere: isNaN(sph) ? 0 : sph,
                    cylinder: isNaN(cyl) ? 0 : cyl,
                    axis: isNaN(axis) ? 0 : axis
                };
            }

            // Convert the sphere
            const sphereConversion = await this.getConversionForSphere(sph);

            // Helper to safely parse DB values which might be strings despite interface saying number
            // (Maintaining this from previous fix as DB structure hasn't changed, only access method)
            const parseVal = (val: any, fallback: number): number => {
                if (val === undefined || val === null || val === '') return fallback;
                const parsed = parseFloat(String(val));
                return isNaN(parsed) ? fallback : parsed;
            };

            const convertedSphere = sphereConversion
                ? (sph < 0 ? parseVal(sphereConversion.lun_moins, sph) : parseVal(sphereConversion.lun_plus, sph))
                : sph;

            // Convert (sphere + cylinder)
            const spherePlusCylinder = sph + cyl;
            const spherePlusCylinderConversion = await this.getConversionForSphere(spherePlusCylinder);

            let convertedSpherePlusCylinder: number;
            if (spherePlusCylinderConversion) {
                convertedSpherePlusCylinder = spherePlusCylinder < 0
                    ? parseVal(spherePlusCylinderConversion.lun_moins, spherePlusCylinder)
                    : parseVal(spherePlusCylinderConversion.lun_plus, spherePlusCylinder);
            } else {
                convertedSpherePlusCylinder = spherePlusCylinder;
            }

            // Calculate new cylinder: new cylinder = convertedSpherePlusCylinder - convertedSphere
            let newCylinder = convertedSpherePlusCylinder - convertedSphere;

            // Start with new sphere = convertedSphere
            let newSphere = convertedSphere;

            // Exception: When type == "Sphérique" AND cylinder != 0.
            if (lensType === 'Sphérique' && Math.abs(cyl) > 0.01) {
                const calculatedSphere = convertedSphere + 0.5 * newCylinder;
                // Round to nearest 0.25 (using signs correctly for myopia/hyperopia)
                newSphere = Math.round(calculatedSphere * 4) / 4;
                newCylinder = 0;
            }

            // Final safety check to ensure we return finite numbers
            return {
                sphere: isFinite(newSphere) ? Number(newSphere) : sph,
                cylinder: isFinite(newCylinder) ? Number(newCylinder) : cyl,
                axis: isFinite(axis) ? Number(axis) : 0
            };

        } catch (error) {
            console.error('Error converting to contact lens:', error);
            return { sphere: sph, cylinder: cyl, axis: axis };
        }
    }
}

/**
 * Singleton instance of LentilleService
 * Use this instance throughout the application for lens conversions
 */
export const lentilleService = new LentilleService();
