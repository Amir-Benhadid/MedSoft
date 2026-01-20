
// Helper functions inlined to avoid dependency chain issues

function parseLocalDate(dateString: string): Date {
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

function calculateAge(dob: string): number {
    const birthDate = parseLocalDate(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function splitTextIntoLines(text: string, maxChars = 80): string[] {
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

function formatNumberWithSign(
    value: string | undefined,
    defaultValue = '0.00'
): string {
    const num = parseFloat(value || defaultValue);
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
}

export const DocumentUtils = {
    // Inlined utilities
    calculateAge,
    splitTextIntoLines,
    formatNumberWithSign,

    numberToFrenchWords: (num: number): string => {
        const ones = [
            '',
            'un',
            'deux',
            'trois',
            'quatre',
            'cinq',
            'six',
            'sept',
            'huit',
            'neuf',
            'dix',
            'onze',
            'douze',
            'treize',
            'quatorze',
            'quinze',
            'seize',
            'dix-sept',
            'dix-huit',
            'dix-neuf',
        ];

        const tens = [
            '',
            '',
            'vingt',
            'trente',
            'quarante',
            'cinquante',
            'soixante',
            'soixante-dix',
            'quatre-vingt',
            'quatre-vingt-dix',
        ];

        if (num === 0) return 'zéro';
        if (num < 20) return ones[num];
        if (num < 100) {
            const ten = Math.floor(num / 10);
            const one = num % 10;
            if (ten === 7 || ten === 9) {
                // Special cases for 70-79 and 90-99
                const base = ten === 7 ? 60 : 80;
                const remainder = num - base;
                return tens[Math.floor(base / 10)] + (remainder > 0 ? '-' + ones[remainder] : '');
            }
            return tens[ten] + (one > 0 ? '-' + ones[one] : '');
        }

        return num.toString(); // Fallback for numbers >= 100
    },

    spectacleToContact: (
        sphere: number,
        cylinder: number,
        axis: number,
        vertexDistanceMm = 12
    ) => {
        const d = vertexDistanceMm / 1000; // mm → m

        // vertex conversion function
        const vtx = (F: number) => F / (1 - d * F);

        // Convert sphere and cylinder
        const Fs = sphere;
        const Fc = cylinder;
        const Fs_contact = vtx(Fs);
        const Fc_contact = vtx(Fc);

        // Round to nearest 0.25D
        const round = (val: number, step: number) => Math.round(val / step) * step;

        return {
            sphere: round(Fs_contact, 0.25),
            cylinder: round(Fc_contact, 0.25),
            axis: axis, // Axis doesn't change
        };
    },

    toTitleCase: (str: string) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },

    splitTextIntoLinesOptimized: (text: string, availableWidth: number) => {
        // Simple implementation - could be enhanced with actual text measurement
        const maxChars = Math.floor(availableWidth / 6); // Approximate character width
        return DocumentUtils.splitTextIntoLines(text, maxChars);
    },

    // Helper function to check if a field is empty or contains only zeros/defaults
    isEmptyField: (value: string | undefined | null): boolean => {
        if (!value) return true;
        const trimmed = value.toString().trim();
        if (trimmed === '') return true;
        if (trimmed === '0' || trimmed === '0.00' || trimmed === '0.0') return true;
        if (trimmed === '-' || trimmed === 'N/A' || trimmed === 'n/a') return true;
        return false;
    },

    // Helper function to format field display value, returning empty string for empty fields
    formatFieldDisplay: (value: string | undefined | null, defaultValue: string = '0.00'): string => {
        if (DocumentUtils.isEmptyField(value)) {
            return '';
        }
        return value?.toString().trim() || '';
    },

    // Helper function to calculate equal column positions based on number of visible fields
    calculateEqualColumnPositions: (
        leftMargin: number,
        rightMargin: number,
        pageWidth: number,
        visibleFieldCount: number,
        includeLabelColumn: boolean = true
    ): number[] => {
        const usableWidth = pageWidth - leftMargin - rightMargin;
        const totalColumns = visibleFieldCount + (includeLabelColumn ? 1 : 0);
        const columnWidth = usableWidth / totalColumns;

        const positions: number[] = [];
        for (let i = 0; i < totalColumns; i++) {
            positions.push(leftMargin + (columnWidth * i));
        }

        return positions;
    },


    // Helper function to format number with sign, returning empty string for zero/empty values
    formatNumberWithSignOrEmpty: (value: string | undefined | null): string => {
        if (DocumentUtils.isEmptyField(value)) {
            return '';
        }
        const num = parseFloat(value || '0');
        if (num === 0) return '';
        return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    },

    calculateNearSph: (sph: string, add: string): string => {
        const sphNum = parseFloat(sph || '0');
        const addNum = parseFloat(add || '0');
        if (isNaN(sphNum) || isNaN(addNum)) return '';
        return (sphNum + addNum).toFixed(2);
    },
};

