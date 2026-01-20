/**
 * Autocomplete Router
 * 
 * Provides ORPC endpoints for managing autocomplete options used throughout
 * the application, including listing, creating, updating, and deleting options.
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { AutocompleteRepository, CreateAutocompleteOptionSchema, AutocompleteOptionSchema } from '../../db/repositories/autocomplete.repository.js';

export const autocompleteRouter = os.router({
    /**
     * Lists all autocomplete options for a category.
     *
     * @param input.category - Category name
     * @returns Array of autocomplete options
     */
    list: os
        .input(z.object({ category: z.string() }))
        .output(z.array(AutocompleteOptionSchema))
        .handler(async ({ input }) => {
            return AutocompleteRepository.findAllByCategory(input.category);
        }),

    /**
     * Creates a new autocomplete option.
     *
     * @param input - Autocomplete option data
     * @returns Created or existing autocomplete option
     */
    create: os
        .input(CreateAutocompleteOptionSchema)
        .output(AutocompleteOptionSchema.optional())
        .handler(async ({ input }) => {
            return AutocompleteRepository.create(input);
        }),

    /**
     * Deletes an autocomplete option.
     *
     * @param input.id - Option ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .handler(async ({ input }) => {
            return AutocompleteRepository.delete(input.id);
        }),

    /**
     * Updates an autocomplete option value.
     *
     * @param input.id - Option ID
     * @param input.value - New value
     * @returns Updated autocomplete option
     */
    update: os
        .input(z.object({ id: z.string(), value: z.string() }))
        .output(AutocompleteOptionSchema.optional())
        .handler(async ({ input }) => {
            return AutocompleteRepository.update(input.id, input.value);
        }),

    /**
     * Increments the frequency counter for an autocomplete option.
     *
     * @param input.id - Option ID
     */
    increment: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            AutocompleteRepository.incrementFrequency(input.id);
        }),
});
