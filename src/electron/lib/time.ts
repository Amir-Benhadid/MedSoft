/**
 * Returns a timestamp in Local ISO format (YYYY-MM-DDTHH:mm:ss).
 * Useful for saving created_at/updated_at fields without UTC timezone shift.
 *
 * @param date - The date to format (defaults to current date/time)
 * @returns Formatted date string in local timezone
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
