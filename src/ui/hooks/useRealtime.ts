/**
 * Realtime Subscription Hook
 * 
 * Sets up realtime data change listeners that automatically invalidate
 * TanStack Query cache when data changes occur in the backend. This ensures
 * the UI stays in sync with the database without manual refresh.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from '@/ui/hooks/use-toast';

/**
 * Hook that subscribes to realtime data changes from Electron
 * 
 * Listens for data change events and invalidates the corresponding query cache
 * to trigger automatic refetching. Also handles special cases like invalidating
 * dependent queries (e.g., todayStats when appointments or waitlist change).
 * 
 * @returns {void} This hook doesn't return anything
 */
export function useRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!window.electronAPI?.onDataChanged) {
            console.error('❌ Realtime updates disabled: electronAPI.onDataChanged not found');
            return;
        }

        const unsubscribe = window.electronAPI.onDataChanged((resource) => {
            // Invalidate the query key for the resource
            queryClient.invalidateQueries({ queryKey: [resource] });

            // Special handling for dependent queries
            if (resource === 'appointments' || resource === 'waitlist' || resource === 'consultations' || resource === 'payments') {
                queryClient.invalidateQueries({ queryKey: ['todayStats'] });
                queryClient.invalidateQueries({ queryKey: ['resume'] });
            }

            // When consultations change, also invalidate last-completed query for radiography dashboard
            if (resource === 'consultations') {
                queryClient.invalidateQueries({ queryKey: ['consultations', 'last-completed'] });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [queryClient]);
}
