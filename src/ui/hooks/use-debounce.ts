/**
 * Debounce Hook
 * 
 * Delays updating a value until after a specified delay period has passed
 * since the last time the value changed. Useful for reducing the frequency
 * of expensive operations like API calls or search queries.
 */

import { useEffect, useState } from 'react';

/**
 * Debounces a value, returning the debounced version that only updates
 * after the specified delay has elapsed since the last change.
 * 
 * @template T - The type of the value being debounced
 * @param {T} value - The value to debounce
 * @param {number} [delay=500] - Delay in milliseconds before updating the debounced value
 * @returns {T} The debounced value
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This will only run 300ms after the user stops typing
 *   performSearch(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
