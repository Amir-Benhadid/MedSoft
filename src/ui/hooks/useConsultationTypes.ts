/**
 * Consultation Types Hooks
 * 
 * Provides TanStack Query hooks for fetching consultation types
 * (appointment types with pricing and configuration).
 */

import { useQuery } from '@tanstack/react-query';
import { orpcClient } from '@/ui/lib/orpc/client';

/**
 * Consultation type data interface
 */
export interface ConsultationType {
    id: number;
    label: string;
    amount: number;
    color: string;
    is_active: number;
    nature?: 'normal' | 'radiography';
}

/**
 * Hook to fetch all consultation types
 * 
 * Consultation types are cached for 1 hour since they don't change frequently.
 * 
 * @returns {UseQueryResult<ConsultationType[]>} Query result containing all consultation types
 */
export const useConsultationTypes = () => {
    return useQuery({
        queryKey: ['consultationTypes'],
        queryFn: async () => {
            return await orpcClient.consultationTypes.list();
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};
