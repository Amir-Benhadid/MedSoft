/**
 * Utility Functions
 * 
 * Provides utility functions for common operations, particularly
 * for combining CSS class names with Tailwind CSS.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names and merges Tailwind CSS classes intelligently
 * 
 * This function uses `clsx` to conditionally combine class names and
 * `twMerge` to merge Tailwind CSS classes, resolving conflicts by
 * keeping the last conflicting class.
 * 
 * @param {...ClassValue} inputs - Variable number of class name inputs
 *   (strings, objects, arrays, etc.)
 * @returns {string} Merged class name string
 * 
 * @example
 * ```tsx
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-2 is overridden by px-4)
 * cn('bg-red-500', { 'text-white': isActive }) // Conditionally includes text-white
 * ```
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

