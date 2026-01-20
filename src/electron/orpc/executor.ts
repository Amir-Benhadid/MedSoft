import { appRouter } from './router.js';

/**
 * Executes an oRPC procedure dynamically by name.
 * 
 * Shared logic between IPC (Electron) and HTTP (Server) handlers.
 * Parses the procedure path (e.g., "auth.verifyPin"), navigates to the handler,
 * and executes it with the provided input.
 *
 * @param procedure - The procedure path (e.g., "auth.verifyPin" or "patients.getAll")
 * @param input - The input data to pass to the procedure handler
 * @returns Promise resolving to an object with data and error properties
 */
export async function executeORPC(procedure: string, input: any) {
    try {
        const [routerName, ...procedurePath] = procedure.split('.');

        const router = (appRouter as any)[routerName];
        if (!router) {
            throw new Error(`Router "${routerName}" not found`);
        }

        let current: any = router;
        for (const segment of procedurePath) {
            if (current && typeof current === 'object' && segment in current) {
                current = current[segment];
            } else {
                throw new Error(`Procedure "${procedure}" not found`);
            }
        }

        const orpcData = current?.['~orpc'];

        if (!orpcData || typeof orpcData.handler !== 'function') {
            throw new Error(`"${procedure}" is not a procedure`);
        }

        const result = await orpcData.handler({ input });

        return {
            data: result,
            error: null,
        };
    } catch (error: any) {
        console.error(`oRPC Execution Error (${procedure}):`, error);
        return {
            data: null,
            error: {
                message: error.message || 'Unknown error',
                code: error.code || 'INTERNAL_ERROR',
            },
        };
    }
}
