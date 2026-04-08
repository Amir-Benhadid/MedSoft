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

	// Helper function to check if a field is empty or contains defaults
	isEmptyField: (value: string | undefined | null): boolean => {
		if (value === undefined || value === null) return true;
		const trimmed = value.toString().trim();
		if (trimmed === '') return true;
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

	// Helper function to format number with sign, returning empty string for empty values
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

		if (num === 0) return '0.00';
		return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
	},

	// Unified format for eye prescriptions shared by Preview and PDF generator
	formatEyePrescription: (sph: string | undefined | null, cyl: string | undefined | null, axis: string | undefined | null, emptyOption: string | undefined | null): string => {
		if (emptyOption === 'conserver') {
			return 'Verre en place';
		}

		const sphText = DocumentUtils.formatNumberWithSignOrEmpty(sph);
		const cylText = DocumentUtils.formatNumberWithSignOrEmpty(cyl);
		const axisRaw = axis || '';
		
		const sphNum = parseFloat(sphText.replace(',', '.')) || 0;
		const cylNum = parseFloat(cylText.replace(',', '.')) || 0;
		const axisExists = axisRaw.trim() !== '';
		const axisNum = parseFloat(axisRaw) || 0;

		const hasData = (sph && sph.trim() !== '') || (cyl && cyl.trim() !== '') || (axis !== undefined && axis !== null && axis.toString().trim() !== '');
		const isEffectivelyZero = sphNum === 0 && cylNum === 0 && axisNum === 0 && !axisExists;

		if (!hasData) {
			return 'Plan';
		}

		// Case: Sphere only (Cyl is 0 and Axis is empty/0)
		if (Math.abs(cylNum) < 0.01 && (!axisExists || axisNum === 0)) {
			// Some users enter "0.00" for an element, but if it hasData and is not effectively zero (e.g. cyl is 0 but sph is 2), display the sph
			return `${sphText} d`;
		}

		// Case: Cylinder present
		const axisText = axisExists ? axisRaw : (axisNum === 0 && (String(axis) === '0') ? '0' : '0');
		return `${sphText} (${cylText} à ${axisText}°)`;
	},

	// Helper: Replace placeholders in text
	processText: (text: string, printData?: Record<string, string>) => {
		if (!text || !printData) return text;
		let processed = text;
	
		// Handle {{fill ...}} pattern
		// First check simple keys in printData
		Object.keys(printData).forEach(key => {
			// Exact match for simple placeholders if any
			// But the new schema uses specific placeholder list strings mostly for input generation
			// The text usually contains {{fill ...}} which we need to parse or map
		});
	
		// For specific placeholders defined in the text like {{fill from EyeData: visualAcuity_OD}}
		// We will try to replace them with values from printData if the key matches a sanitized version
		// OR if we map specific placeholder patterns to printData keys.
	
		// Strategy: The printData keys are derived from the 'placeholders' array in the JSON.
		// We need to map the patterns in the text to these keys.
	
		// Common replacements based on potentially known patterns:
		const replacements: Record<string, string> = {
			'{{fill from EyeData: visualAcuity_OD}}': printData['EyeData.visualAcuity_OD'] || '______',
			'{{fill from EyeData: visualAcuity_OG}}': printData['EyeData.visualAcuity_OG'] || '______',
			'{{fill number between 1 and 4}}': printData['retinopathie_stade'] || '___',
			'{{fill: droit/gauche}}': printData['oeil_droit_gauche'] || '______', // generic side
			'{{fill age}}': printData['age'] || '___',
			'{{fill antecedents}}': printData['antecedents'] || '____________________',
			'{{fill date}}': printData['date_reprise'] || '___/___/______',
			'{{fill indication}}': printData['indication'] || '____________________',
			'{{fill: droite/gauche}}': printData['cote_droite_gauche'] || '______',
			'(voir diagnostic)': printData['diagnostic'] ? `(${printData['diagnostic']})` : '(voir diagnostic)',
			'(voir ATCD)': printData['ATCD'] ? `(${printData['ATCD']})` : '(voir ATCD)',
		};
	
		// Apply known replacements
		Object.entries(replacements).forEach(([pattern, value]) => {
			processed = processed.split(pattern).join(value);
		});
	
		// Also try to replace direct keys if they exist in curly braces similar to previous logic
		// e.g. if user manually added {{diagnostic}}
		if (printData) {
			Object.keys(printData).forEach(key => {
				const bracketPattern = `{{${key}}}`;
				if (processed.includes(bracketPattern)) {
					processed = processed.split(bracketPattern).join(printData[key]);
				}
			});
		}
	
		return processed;
	},
};
