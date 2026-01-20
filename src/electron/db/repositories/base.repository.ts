/**
 * Base Repository
 * 
 * Provides common database operations for all repository classes.
 * All repositories should extend this class to inherit these methods.
 */

import Database from 'better-sqlite3';

/**
 * Abstract base class for database repositories.
 * Provides common CRUD operations and transaction support.
 */
export abstract class BaseRepository {
	/**
	 * Creates a new BaseRepository instance.
	 *
	 * @param db - The database instance to use
	 */
	constructor(protected db: Database.Database) {}

	/**
	 * Executes a query and returns all matching results.
	 *
	 * @param sql - The SQL query string
	 * @param params - Query parameters (default: empty array)
	 * @returns Array of results matching type T
	 */
	protected all<T>(sql: string, params: any[] = []): T[] {
		const stmt = this.db.prepare(sql);
		return stmt.all(params) as T[];
	}

	/**
	 * Executes a query and returns the first matching result.
	 *
	 * @param sql - The SQL query string
	 * @param params - Query parameters (default: empty array)
	 * @returns The first result matching type T, or undefined if not found
	 */
	protected get<T>(sql: string, params: any[] = []): T | undefined {
		const stmt = this.db.prepare(sql);
		return stmt.get(params) as T | undefined;
	}

	/**
	 * Executes a query and returns the first matching result.
	 * Throws an error if no result is found.
	 *
	 * @param sql - The SQL query string
	 * @param params - Query parameters (default: empty array)
	 * @returns The first result matching type T
	 * @throws Error if no record is found
	 */
	protected getRequired<T>(sql: string, params: any[] = []): T {
		const result = this.get<T>(sql, params);
		if (!result) {
			throw new Error('Record not found');
		}
		return result;
	}

	/**
	 * Executes a query (INSERT, UPDATE, DELETE) and returns the result.
	 *
	 * @param sql - The SQL query string
	 * @param params - Query parameters (default: empty array)
	 * @returns Database.RunResult containing affected rows and last insert ID
	 */
	protected run(sql: string, params: any[] = []): Database.RunResult {
		const stmt = this.db.prepare(sql);
		return stmt.run(params);
	}

	/**
	 * Executes a function within a database transaction.
	 * All operations in the function are atomic - either all succeed or all fail.
	 *
	 * @param fn - Function to execute within the transaction
	 * @returns The return value of the function
	 */
	protected transaction<T>(fn: () => T): T {
		return this.db.transaction(fn)();
	}
}

