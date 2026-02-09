/**
 * Text utility functions
 * Common text manipulation operations
 */

/**
 * Split text into lines with max character limit
 */
export function splitTextIntoLines(text: string, maxChars = 80): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if ((currentLine + word).length <= maxChars) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                lines.push(word);
            }
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

/**
 * Format number with sign (+ or -)
 */
export function formatNumberWithSign(
    value: string | undefined,
    defaultValue = '0.00'
): string {
    const num = parseFloat(value || defaultValue);
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
