/**
 * Authentication Router
 * 
 * Provides ORPC endpoints for PIN-based authentication, including PIN verification,
 * checking if a PIN exists, and updating the PIN.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';

export const authRouter = os.router({
	/**
	 * Verifies a PIN code.
	 *
	 * @param input.pin - PIN code to verify
	 * @returns Object with valid boolean indicating if PIN is correct
	 */
	verifyPin: os
		.input(
			z.object({
				pin: z.string().min(1),
			})
		)
		.handler(async ({ input }) => {
			const service = new AuthService();
			const isValid = await service.verifyPin(input.pin);
			return { valid: isValid };
		}),

	/**
	 * Checks if a PIN has been set.
	 *
	 * @returns Object with hasPin boolean indicating if PIN exists
	 */
	getPin: os.handler(async () => {
		const service = new AuthService();
		const hasPin = await service.hasPin();
		return { hasPin };
	}),

	/**
	 * Updates the PIN code.
	 *
	 * @param input.newPin - New PIN code (minimum 4 characters)
	 * @param input.confirmPin - Confirmation PIN code
	 * @returns Success indicator
	 * @throws Error if PINs don't match or PIN is too short
	 */
	updatePin: os
		.input(
			z.object({
				newPin: z.string().min(4, 'Le PIN doit contenir au moins 4 caractères'),
				confirmPin: z.string(),
			})
		)
		.handler(async ({ input }) => {
			if (input.newPin !== input.confirmPin) {
				throw new Error('Les codes PIN ne correspondent pas');
			}

			const service = new AuthService();
			await service.updatePin(input.newPin);
			return { success: true };
		}),
});

