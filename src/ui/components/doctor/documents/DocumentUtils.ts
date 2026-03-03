import { calculateAge } from '../../../utils/dateUtils';
import { splitTextIntoLines, formatNumberWithSign } from '../../../utils/textUtils';

export const DocumentUtils = {
	// Use shared utilities
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
		const maxChars = Math.floor(availableWidth / 4.8); // Approximate character width for 10pt font
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
		return value?.toString().replace(/ \| /g, ' ').trim() || '';
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

		// Handle comma for French users
		const normalizedValue = value ? value.toString().replace(',', '.') : '0';
		const num = parseFloat(normalizedValue);

		if (isNaN(num)) {
			return value || ''; // Return original string if it's not a number (e.g. "10/10")
		}

		if (num === 0) return '';
		return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
	},
};
