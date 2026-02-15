/**
 * Conversion Router
 * 
 * Provides ORPC endpoints for lens prescription conversions between
 * glasses and contact lenses.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { conversionRepository } from '../../db/repositories/conversion.repository.js';

export const conversionRouter = os.router({
    /**
     * Gets the closest conversion for a given sphere value.
     *
     * @param input.sphere - Sphere value to convert
     * @returns Conversion data or null if not found
     */
    getConversion: os
        .input(z.object({ sphere: z.number() }))
        .handler(async ({ input }) => {
            const result = conversionRepository.getConversionForSphere(input.sphere);
            return result;
        }),

    /**
     * Gets all conversion records.
     * Used for client-side caching.
     */
    getAll: os
        .handler(async () => {
            return conversionRepository.getAllConversions();
        }),
});
