/**
 * Text utility functions
 * Common text manipulation operations
 */

/**
 * Split text into lines with max character limit
 */
export function splitTextIntoLines(text: string, maxChars = 80): string[] {
    if (!text) return [];
    const sourceLines = text.split(/\r?\n/);
    const finalLines: string[] = [];

    for (const sourceLine of sourceLines) {
        if (!sourceLine) {
            finalLines.push('');
            continue;
        }

        const words = sourceLine.split(' ');
        let currentLine = '';

        for (const word of words) {
            if (!currentLine) {
                currentLine = word;
            } else if ((currentLine + ' ' + word).length <= maxChars) {
                currentLine += ' ' + word;
            } else {
                finalLines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) {
            finalLines.push(currentLine);
        }
    }

    return finalLines;
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
