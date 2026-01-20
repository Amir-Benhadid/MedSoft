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
        sph: number,
        cyl: number,
        axis: number,
        lensType: string
    ): Promise<{ sphere: number; cylinder: number; axis: number }> {
        try {
            // General conversion formula:
            // 1. Convert sphere -> convertedSphere
            // 2. Convert (sphere + cylinder) -> convertedSpherePlusCylinder
            // 3. new cylinder = convertedSpherePlusCylinder - convertedSphere
            // 4. new sphere = convertedSphere
            // Exception: When type == "Sphérique" AND cylinder > 0:
            //   new sphere = convertedSphere + new cylinder

            // Convert the sphere
            const sphereConversion = await this.getConversionForSphere(sph);

            // If no conversion found, usually means power is low (<4.00) where Vertex Distance doesn't matter much, 
            // OR it's out of range. 
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
                // If no conversion found for (sphere + cylinder), use original value
                convertedSpherePlusCylinder = spherePlusCylinder;
            }

            // Calculate new cylinder: new cylinder = convertedSpherePlusCylinder - convertedSphere
            let newCylinder = convertedSpherePlusCylinder - convertedSphere;

            // Start with new sphere = convertedSphere
            let newSphere = convertedSphere;

            // Exception: When type == "Sphérique" AND cylinder > 0. (Maybe for spherical equivalent?)
            if (lensType === 'Sphérique' && cyl !== 0) {
                // Use the new cylinder for calculation but result will just be a sphere
                const calculatedSphere = convertedSphere + 0.5 * newCylinder;
                newSphere = Math.ceil(calculatedSphere * 4) / 4;
                newCylinder = 0;
            }

            // Ensure we return numbers
            return {
                sphere: Number(newSphere),
                cylinder: Number(newCylinder),
                axis: Number(axis)
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
