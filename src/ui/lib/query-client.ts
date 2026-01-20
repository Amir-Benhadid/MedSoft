/**
 * TanStack Query Client Configuration
 * 
 * Configures the React Query client with default options for queries and mutations.
 * This client is used throughout the application for data fetching, caching, and
 * synchronization with the backend.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Pre-configured TanStack Query client instance
 * 
 * Default configuration:
 * - Queries: 5 minute stale time, 10 minute garbage collection, 1 retry attempt,
 *   no refetch on window focus
 * - Mutations: No retry attempts
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
			retry: 1,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 0,
		},
	},
});

