export interface MedicineOption {
    value: string;
    label: string;
    category?: string;
    form?: string;
    strength?: string;
    defaultDosage?: string;
    prescriptionRequired?: boolean;
    packaging?: string;
    id?: string;
    manufacturer?: string;
    activeIngredient?: string;
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { orpcClient } from '@/ui/lib/orpc/client';

interface UseMedicinesPaginatedReturn {
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

export const useMedicinesPaginated = (
    initialPageSize: number = 20
): UseMedicinesPaginatedReturn => {
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
                let data;
                if (search.trim()) {
                    data = await orpcClient.medications.search({
                        query: search.trim(),
                        limit: initialPageSize,
                        offset
                    });
                } else {
                    data = await orpcClient.medications.list({
                        limit: initialPageSize,
                        offset
                    });
                }

                const mappedMedicines: MedicineOption[] = data.map((med: any) => ({
                    value: med.medication_name,
                    label: med.strength
                        ? `${med.medication_name} - ${med.strength}`
                        : med.medication_name,
                    category: med.category || 'Other',
                    form: med.type || '',
                    strength: med.strength || '',
                    defaultDosage: med.instructions || '',
                    prescriptionRequired: true,
                    packaging: med.packaging || '',
                    id: med.id,
                    manufacturer: '',
                    activeIngredient: '',
                }));

                const hasMoreData = data.length === initialPageSize;

                if (append) {
                    setMedicines((prev) => [...prev, ...mappedMedicines]);
                } else {
                    setMedicines(mappedMedicines);
                }

                setHasMore(hasMoreData);
                setTotal(0); // Optional: not usually retrievable easily from list without count
                setCurrentOffset(offset);
            } catch (err) {
                console.error('Error loading medicines from local DB:', err);
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

    // Add new medicine to local DB
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

                await orpcClient.medications.create({
                    medication_name: medicine.medicationName,
                    strength: medicine.strength || null,
                    type: medicine.type || null,
                    packaging: medicine.packaging || null,
                    instructions: medicine.instructions || null,
                    category: medicine.category || null,
                });

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
