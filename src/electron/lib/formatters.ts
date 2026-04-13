/**
 * Formats a numeric value with an explicit sign (+/-) and two decimal places.
 * Used for ophthalmic measurements (sphere, cylinder, addition).
 *
 * Examples: 2 → "+2.00", -1.5 → "-1.50", 0 → "0.00", "" → ""
 */
export const formatNumberWithSign = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === '') return '';
    const strVal = value.toString().replace(',', '.');
    const num = parseFloat(strVal);
    if (isNaN(num) || !isFinite(num)) return value?.toString() || '';
    if (num === 0) return '0.00';
    const formatted = num.toFixed(2);
    return num > 0 ? `+${formatted}` : formatted;
};
