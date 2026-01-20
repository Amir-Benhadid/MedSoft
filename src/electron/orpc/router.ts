/**
 * Main Application Router
 * 
 * Combines all feature routers into a single appRouter for oRPC.
 * This is the root router that contains all available procedures.
 */

import { os, RouterClient } from '@orpc/server';
import { authRouter } from './routers/auth.router.js';
import { appointmentsRouter } from './routers/appointments.router.js';
import { patientsRouter } from './routers/patients.router.js';
import { waitlistRouter } from './routers/waitlist.router.js';
import { messagesRouter } from './routers/messages.router.js';
import { todosRouter } from './routers/todos.router.js';
import { statsRouter } from './routers/stats.router.js';
import { conversionRouter } from './routers/conversion.router.js';

import { consultationsRouter } from './routers/consultations.router.js';
import { consultationTypesRouter } from './routers/consultation_types.router.js';

import { invoicesRouter } from './routers/invoices.router.js';
import { medicationRouter } from './routers/medication.router.js';
import { autocompleteRouter } from './routers/autocomplete.router.js';
import { professionalContactsRouter } from './routers/professional_contacts.router.js';
import { booksRouter } from './routers/books.router.js';
import { radiographyRouter } from './routers/radiography.router.js';

const routerDef = {
	auth: authRouter,
	appointments: appointmentsRouter,
	patients: patientsRouter,
	waitlist: waitlistRouter,
	consultations: consultationsRouter,
	consultationTypes: consultationTypesRouter,
	invoices: invoicesRouter,
	medications: medicationRouter,
	autocomplete: autocompleteRouter,
	messages: messagesRouter,
	todos: todosRouter,
	stats: statsRouter,
	conversion: conversionRouter,
	professionalContacts: professionalContactsRouter,
	books: booksRouter,
	radiography: radiographyRouter,
};

console.log('🔄 Initializing appRouter');
console.log('Keys in routerDef:', Object.keys(routerDef));
export const appRouter = os.router(routerDef);
console.log('Keys in appRouter:', Object.keys(appRouter));

/**
 * Type definition for the application router.
 * Used for type-safe procedure calls.
 */
export type AppRouter = typeof appRouter;

/**
 * Type definition for the oRPC client.
 * Used for type-safe client-side procedure invocations.
 */
export type AppClient = RouterClient<typeof appRouter>;
