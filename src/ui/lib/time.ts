/**
 * Time utility functions for handling LOCAL date ranges only.
 * We strictly avoid UTC conversions to ensure what you see is what you get.
 */

/**
 * Returns today's date in local YYYY-MM-DD format
 */
export function getLocalTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Returns the current timestamp in Local ISO format (YYYY-MM-DDTHH:mm:ss)
 * Useful for saving created_at/updated_at fields without UTC shift.
 */
export function getLocalISOString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Returns a range covering the entire day in LOCAL time.
 * Input: "2024-01-01"
 * Output: { start: "2024-01-01T00:00:00", end: "2024-01-01T23:59:59" }
 */
export function getDayRangeEncoded(dateString: string): { start: string; end: string } {
    if (!dateString) {
        const today = getLocalTodayDate();
        return getDayRangeEncoded(today);
    }

    return {
        start: `${dateString}T00:00:00`,
        end: `${dateString}T23:59:59`
    };
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) to DD/MM/YYYY
 * preventing timezone shifts by treating the string as local date parts.
 */
export function formatDateDisplay(dateString?: string | null): string {
    if (!dateString) return '';

    // Take the first part YYYY-MM-DD
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');

    if (parts.length !== 3) return dateString; // Fallback

    // Return formatted as DD/MM/YYYY
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Calculates age from a date string, avoiding timezone shifts
 */
export function calculateAge(dob?: string | null): number | null {
    if (!dob) return null;

    const datePart = dob.split('T')[0];
    const birthDate = new Date(`${datePart}T00:00:00`);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}
