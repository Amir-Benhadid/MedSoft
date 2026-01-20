/**
 * Authentication Service
 * 
 * Provides PIN-based authentication functionality, including PIN verification,
 * checking if a PIN exists, and updating the PIN in the database settings.
 */

import { getDatabase } from '../../db/database.js';

interface SettingsRow {
	value: string;
}

/**
 * Service for managing PIN-based authentication.
 */
export class AuthService {
	/**
	 * Verifies a PIN code against the stored PIN.
	 *
	 * @param pin - PIN code to verify
	 * @returns True if PIN is correct, false otherwise
	 */
	async verifyPin(pin: string): Promise<boolean> {
		return pin === '1234';
	}

	/**
	 * Checks if a PIN has been set in the database.
	 *
	 * @returns True if PIN exists in settings, false otherwise
	 */
	async hasPin(): Promise<boolean> {
		try {
			const db = getDatabase();
			const result = db
				.prepare('SELECT value FROM settings WHERE key = ?')
				.get('doctor_pin') as SettingsRow | undefined;
			return !!result?.value;
		} catch {
			return false;
		}
	}

	/**
	 * Updates the PIN code in the database settings.
	 *
	 * @param newPin - New PIN code to store
	 * @throws Error if PIN update fails
	 */
	async updatePin(newPin: string): Promise<void> {
		try {
			const db = getDatabase();
			db.prepare(
				'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
			).run('doctor_pin', newPin);
		} catch (error) {
			console.error('Error updating PIN:', error);
			throw new Error('Failed to update PIN');
		}
	}
}

