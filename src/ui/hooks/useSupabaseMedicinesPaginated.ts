import { useCallback, useEffect, useRef, useState } from 'react';
import { supabaseMedicineService } from '../services/supabaseMedicineService';
import { MedicineOption } from './useMedicinesPaginated';

interface UseSupabaseMedicinesPaginatedReturn {
    medicines: MedicineOption[];
    loading: boolean;
    hasMore: boolean;
    total: number;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    addMedicine: (medicine: {
        medicationName: string;
        strength?: string;
        type?: string;
        packaging?: string;
        instructions?: string;
        category?: string;
        activeIngredient?: string;
        manufacturer?: string;
        prescriptionRequired?: boolean;
    }) => Promise<void>;
    error: string | null;
}

export const useSupabaseMedicinesPaginated = (
    initialPageSize: number = 20
): UseSupabaseMedicinesPaginatedReturn => {
    const [medicines, setMedicines] = useState<MedicineOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [currentOffset, setCurrentOffset] = useState(0);

    // Refs for debouncing and avoiding stale closures
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const currentSearchRef = useRef<string>('');
    const isLoadingRef = useRef<boolean>(false);

    // Load medicines with pagination
    const loadMedicines = useCallback(
        async (
            offset: number = 0,
            search: string = '',
            append: boolean = false
        ) => {
            // Prevent multiple simultaneous requests
            if (isLoadingRef.current) return;

            isLoadingRef.current = true;
            setLoading(true);
            setError(null);

            try {
                const result = await supabaseMedicineService.searchMedicines(
                    search.trim() || '',
                    initialPageSize,
                    offset
                );

                if (append) {
                    setMedicines((prev) => [...prev, ...result.medicines]);
                } else {
                    setMedicines(result.medicines);
                }

                setHasMore(result.hasMore);
                setTotal(result.total);
                setCurrentOffset(offset);
            } catch (err) {
                console.error('Error loading medicines from Supabase:', err);
                setError(err instanceof Error ? err.message : 'Failed to load medicines');

                // Reset state on error
                if (!append) {
                    setMedicines([]);
                    setHasMore(false);
                    setTotal(0);
                }
            } finally {
                isLoadingRef.current = false;
                setLoading(false);
            }
        },
        [initialPageSize]
    );

    // Load more medicines (pagination)
    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return;
        const nextOffset = currentOffset + initialPageSize;
        await loadMedicines(nextOffset, currentSearchRef.current, true);
    }, [hasMore, loading, currentOffset, initialPageSize, loadMedicines]);

    // Refresh medicines (reload from beginning)
    const refresh = useCallback(async () => {
        setCurrentOffset(0);
        setError(null);
        await loadMedicines(0, currentSearchRef.current, false);
    }, [loadMedicines]);

    // Add new medicine to Supabase
    const addMedicine = useCallback(
        async (medicine: {
            medicationName: string;
            strength?: string;
            type?: string;
            packaging?: string;
            instructions?: string;
            category?: string;
            activeIngredient?: string;
            manufacturer?: string;
            prescriptionRequired?: boolean;
        }) => {
            try {
                setLoading(true);
                setError(null);

                await supabaseMedicineService.addMedicine(medicine);

                // Refresh the list to include the new medicine
                setCurrentOffset(0);
                await loadMedicines(0, currentSearchRef.current, false);
            } catch (err) {
                console.error('Error adding medicine:', err);
                setError(err instanceof Error ? err.message : 'Failed to add medicine');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadMedicines]
    );

    // Debounced search effect
    useEffect(() => {
        currentSearchRef.current = searchTerm;

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            // Reset pagination and load fresh results
            setCurrentOffset(0);
            loadMedicines(0, searchTerm, false);
        }, 300); // 300ms debounce

        // Cleanup on unmount or search change
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, loadMedicines]);

    // Initial load
    useEffect(() => {
        loadMedicines(0, '', false);
    }, [loadMedicines]);

    return {
        medicines,
        loading,
        hasMore,
        total,
        searchTerm,
        setSearchTerm,
        loadMore,
        refresh,
        addMedicine,
        error,
    };
};
