/**
 * TanStack Router Configuration
 * 
 * Sets up the application router with support for both Electron (hash-based)
 * and browser (standard) routing. Configures route preloading and 404 handling.
 */

import { createRouter as createTanStackRouter, createHashHistory } from '@tanstack/react-router';
import { routeTree } from '@/ui/routeTree.gen';

/**
 * Determines the appropriate history implementation based on the environment
 * - Electron (file:// protocol): Uses hash-based routing
 * - Browser: Uses standard browser history
 */
const history = window.location.protocol === 'file:' ? createHashHistory() : undefined;

// Debug logs for Electron environment
if (window.location.protocol === 'file:') {
	console.log('🔍 Electron detected - Route tree:', routeTree);
	console.log('🔍 Current location:', window.location.href);
	console.log('🔧 Using HashHistory for Electron');
}

/**
 * Default 404 component displayed when a route is not found
 * @returns {JSX.Element} 404 error message component
 */
const defaultNotFoundComponent = () => (
	<div style={{ padding: '2rem', textAlign: 'center' }}>
		<h1>404 - Page Not Found</h1>
		<p>The page you're looking for doesn't exist.</p>
	</div>
);

/**
 * TanStack Router instance configured for the application
 * 
 * Configuration:
 * - Uses generated route tree from routeTree.gen.ts
 * - Preloads routes on intent (hover/focus)
 * - Custom 404 component for unmatched routes
 * - Hash-based history for Electron, standard for browser
 */
export const router = createTanStackRouter({
	routeTree,
	history,
	defaultPreload: 'intent',
	defaultNotFoundComponent,
});

/**
 * Type registration for TanStack Router
 * Provides type safety for router usage throughout the application
 */
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}

