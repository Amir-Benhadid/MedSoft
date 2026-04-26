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

/**
 * Capitalizes the first letter of each word and lowers the rest.
 */
export const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

/**
 * Formats patient name as "Surname   Name" with 3 spaces and TitleCase.
 */
export const formatPatientName = (surname: string | undefined, name: string | undefined): string => {
    const s = toTitleCase(surname || '').trim();
    const n = toTitleCase(name || '').trim();
    if (!s && !n) return '';
    if (!s) return n;
    if (!n) return s;
    return `${s}\u00A0\u00A0\u00A0${n}`;
};
