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
    /**
     * Fetches conversion data for a specific sphere value from the backend
     * 
     * @param {number} sphere - Sphere value to look up conversion for
     * @returns {Promise<LentilleConversion | null>} Conversion data or null if not found
     */
    public async getConversionForSphere(sphere: number): Promise<LentilleConversion | null> {
        try {
            const result = await orpcClient.conversion.getConversion({ sphere });
            return result;
        } catch (error) {
            console.error('Error fetching conversion for sphere:', sphere, error);
            return null;
        }
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
        // Normalize inputs - handle strings with commas
        const normalize = (val: any) => {
            if (typeof val === 'string') {
                return parseFloat(val.replace(',', '.'));
            }
            return parseFloat(String(val || 0));
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

            // If no conversion found, power is low (<4.00) or out of range
            if (!sphereConversion) {
                return { sphere: sph, cylinder: cyl, axis: axis };
            }

            const convertedSphere = sph < 0
                ? (sphereConversion.lun_moins ?? sph)
                : (sphereConversion.lun_plus ?? sph);

            // Convert (sphere + cylinder)
            const spherePlusCylinder = sph + cyl;
            const spherePlusCylinderConversion = await this.getConversionForSphere(spherePlusCylinder);

            let convertedSpherePlusCylinder: number;
            if (spherePlusCylinderConversion) {
                convertedSpherePlusCylinder = spherePlusCylinder < 0
                    ? (spherePlusCylinderConversion.lun_moins ?? spherePlusCylinder)
                    : (spherePlusCylinderConversion.lun_plus ?? spherePlusCylinder);
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
