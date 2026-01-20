/**
 * Main React Application Entry Point
 * 
 * Initializes and renders the React application with all necessary providers:
 * - TanStack Query for data fetching and caching
 * - TanStack Router for routing
 * - Material-UI theme provider
 * - Realtime subscriptions for live data updates
 * - Toast notifications
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { queryClient } from './lib/query-client';
import { router } from './lib/router';
import { Toaster } from './components/ui/toaster';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import { useRealtime } from './hooks/useRealtime';

console.log('🚀 UI: Application starting...');

/**
 * Material-UI theme configuration with transparent background
 * Prevents white flash during application startup in Electron
 */
const theme = createTheme({
	palette: {
		background: {
			default: 'transparent',
		},
	},
});

/**
 * Root DOM element where the React application will be mounted
 * @throws {Error} If the root element is not found in the DOM
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Root element not found');
}

/**
 * Renders the React application with all providers
 * - QueryClientProvider: Provides TanStack Query client for data fetching
 * - RealtimeWatcher: Component that initializes realtime subscriptions
 * - ThemeProvider: Provides Material-UI theme
 * - RouterProvider: Provides TanStack Router for navigation
 * - Toaster: Provides toast notification system
 */
createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<RealtimeWatcher />
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<RouterProvider router={router} />
				<Toaster />
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>
);

/**
 * Component that initializes realtime subscriptions
 * This component doesn't render anything but sets up the realtime connection
 * @returns {null} Renders nothing
 */
function RealtimeWatcher() {
	useRealtime();
	return null;
}

console.log('✅ UI: Application mounted successfully');
