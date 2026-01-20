/**
 * Checks if the application is running in development mode.
 *
 * @returns True if NODE_ENV is 'development', false otherwise
 */
export function isDev(): boolean {
	return process.env.NODE_ENV === 'development';
}
