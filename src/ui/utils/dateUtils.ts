/**
 * Date utility functions
 * Common date operations used across the application
 */

/**
 * Calculate age from date of birth
 */
/**
 * Parse a date string (YYYY-MM-DD) as a local date without timezone conversion
 * This prevents dates from shifting by a day due to timezone differences
 */
export function parseLocalDate(dateString: string): Date {
    if (!dateString) {
        return new Date();
    }

    // If the string is already in YYYY-MM-DD format, parse it as local date
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }

    // Fallback to standard Date parsing for other formats
    return new Date(dateString);
}

export function calculateAge(dob: string): number {
    const birthDate = parseLocalDate(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

/**
 * Format a date string (YYYY-MM-DD) to French locale string without timezone conversion
 * This ensures dates are displayed exactly as stored, regardless of timezone
 */
export function formatDateStringToFrench(dateString: string): string {
    if (!dateString) return 'Date invalide';

    // Parse as local date to avoid timezone conversion
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date to French locale string
 */
export function formatDateToFrench(date: Date | string): string {
    if (typeof date === 'string') {
        // If it's a date string (YYYY-MM-DD), parse it as local date
        return formatDateStringToFrench(date);
    }
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format date and time to French locale string
 */
export function formatDateTimeToFrench(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Normalize a Date object to local midnight to prevent timezone issues
 * This ensures the date components represent the actual local date
 */
export function normalizeToLocalMidnight(date: Date): Date {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return normalized;
}

/**
 * Format a Date object as a plain date string (YYYY-MM-DD) without ANY timezone conversion
 * This extracts date components directly and formats as a string, ensuring the date
 * is saved exactly as displayed, regardless of timezone
 */
export function formatLocalDate(date: Date): string {
    // Extract date components directly from the Date object
    // These methods return LOCAL date components, not UTC
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();

    // Format as plain string YYYY-MM-DD (no timezone, no time, just date)
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return dateString;
}

/**
 * Get today's date in ISO format (YYYY-MM-DD) using local date, no timezone conversion
 * This explicitly uses local date components to avoid any timezone issues
 */
export function getTodayISO(): string {
    // Create a new Date object for right now
    const now = new Date();

    // Explicitly get local date components (these methods return LOCAL values, not UTC)
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() is 0-indexed
    const day = now.getDate();

    // Format as YYYY-MM-DD string
    const todayString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return todayString;
}

/**
 * Extract date part (YYYY-MM-DD) from a date string or Date object without timezone conversion
 * This ensures dates are compared correctly regardless of timezone
 * 
 * IMPORTANT: For date strings from database (ISO format with time), we extract the date part
 * directly without parsing as Date object to avoid timezone conversion issues.
 */
export function extractLocalDate(dateInput: Date | string): string {
    if (typeof dateInput === 'string') {
        // Extract the date part (before 'T' or space) - this is the actual date stored
        const datePart = dateInput.split(/[T\s]/)[0];

        // If it's already in YYYY-MM-DD format, return it directly
        // This avoids timezone conversion issues when dates are stored as UTC timestamps
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
        }

        // If not in expected format, try to parse it as local date
        const localDate = parseLocalDate(datePart);
        return formatLocalDate(localDate);
    }
    // If it's a Date object, format it as local date
    return formatLocalDate(dateInput);
}

/**
 * Check if date is today (using local dates, no timezone conversion)
 */
export function isToday(date: Date | string): boolean {
    const dateStr = extractLocalDate(date);
    const todayStr = getTodayISO();
    return dateStr === todayStr;
}

/**
 * Round date to nearest hour
 */
export function roundToNearestHour(date: Date): Date {
    const rounded = new Date(date);
    rounded.setMinutes(0, 0, 0);
    return rounded;
}
