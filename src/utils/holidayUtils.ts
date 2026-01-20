/**
 * Holiday Utilities
 * 
 * Provides utilities for managing holidays, including fetching holiday data,
 * checking if dates are holidays or weekends, and calculating next available
 * appointment dates excluding holidays and weekends.
 */

/**
 * Represents a holiday with date and metadata.
 */
export interface Holiday {
	date: string;
	name: string;
	public: boolean;
	observed?: string;
	country?: string;
	uuid?: string;
	subdivisions?: string[];
}

/**
 * Hardcoded Algerian holidays for 2024, 2025, and 2026.
 * Includes national holidays, religious holidays, and public observances.
 */
const ALGERIAN_HOLIDAYS: Record<string, Holiday[]> = {
	'2024': [
		{ date: '2024-01-01', name: "New Year's Day", public: true, country: 'DZ' },
		{
			date: '2024-01-12',
			name: 'Yennayer (Amazigh New Year)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-03-10',
			name: 'Eid al-Fitr (End of Ramadan)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-03-11',
			name: 'Eid al-Fitr Holiday',
			public: true,
			country: 'DZ',
		},
		{ date: '2024-05-01', name: 'Labour Day', public: true, country: 'DZ' },
		{
			date: '2024-06-17',
			name: 'Eid al-Adha (Feast of Sacrifice)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-06-18',
			name: 'Eid al-Adha Holiday',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-07-05',
			name: 'Independence Day',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-07-17',
			name: 'Islamic New Year',
			public: true,
			country: 'DZ',
		},
		{
			date: '2024-09-26',
			name: 'Mawlid (Birth of the Prophet)',
			public: true,
			country: 'DZ',
		},
		{ date: '2024-11-01', name: 'Revolution Day', public: true, country: 'DZ' },
	],
	'2025': [
		{ date: '2025-01-01', name: "New Year's Day", public: true, country: 'DZ' },
		{
			date: '2025-01-12',
			name: 'Yennayer (Amazigh New Year)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-03-01',
			name: 'Eid al-Fitr (End of Ramadan)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-03-02',
			name: 'Eid al-Fitr Holiday',
			public: true,
			country: 'DZ',
		},
		{ date: '2025-05-01', name: 'Labour Day', public: true, country: 'DZ' },
		{
			date: '2025-06-07',
			name: 'Eid al-Adha (Feast of Sacrifice)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-06-08',
			name: 'Eid al-Adha Holiday',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-07-05',
			name: 'Independence Day',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-07-07',
			name: 'Islamic New Year',
			public: true,
			country: 'DZ',
		},
		{
			date: '2025-09-16',
			name: 'Mawlid (Birth of the Prophet)',
			public: true,
			country: 'DZ',
		},
		{ date: '2025-11-01', name: 'Revolution Day', public: true, country: 'DZ' },
	],
	'2026': [
		{ date: '2026-01-01', name: "New Year's Day", public: true, country: 'DZ' },
		{
			date: '2026-01-12',
			name: 'Yennayer (Amazigh New Year)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-02-18',
			name: 'Eid al-Fitr (End of Ramadan)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-02-19',
			name: 'Eid al-Fitr Holiday',
			public: true,
			country: 'DZ',
		},
		{ date: '2026-05-01', name: 'Labour Day', public: true, country: 'DZ' },
		{
			date: '2026-05-27',
			name: 'Eid al-Adha (Feast of Sacrifice)',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-05-28',
			name: 'Eid al-Adha Holiday',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-06-26',
			name: 'Islamic New Year',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-07-05',
			name: 'Independence Day',
			public: true,
			country: 'DZ',
		},
		{
			date: '2026-09-05',
			name: 'Mawlid (Birth of the Prophet)',
			public: true,
			country: 'DZ',
		},
		{ date: '2026-11-01', name: 'Revolution Day', public: true, country: 'DZ' },
	],
};

/**
 * Fetches holidays for a specified country and year.
 * Currently only supports Algeria (DZ).
 *
 * @param country - Country code (currently only 'DZ' is supported)
 * @param year - Year to fetch holidays for
 * @returns Array of holidays for the specified year, empty array if not supported
 */
export const fetchHolidays = async (
	country: string,
	year: number
): Promise<Holiday[]> => {
	if (country !== 'DZ') {
		console.warn(
			`Holidays for ${country} are not available, only supporting Algeria (DZ)`
		);
		return [];
	}

	return ALGERIAN_HOLIDAYS[year.toString()] || [];
};

/**
 * Checks if a given date is a holiday.
 *
 * @param date - Date to check
 * @param holidays - Array of holidays to check against
 * @returns True if the date matches any holiday, false otherwise
 */
export const isHoliday = (date: Date, holidays: Holiday[]): boolean => {
	const dateString = date.toISOString().split('T')[0];
	return holidays.some((holiday) => holiday.date === dateString);
};

/**
 * Checks if a date is a weekend (Friday or Saturday in Algeria).
 *
 * @param date - Date to check
 * @returns True if the date is Friday (5) or Saturday (6), false otherwise
 */
export const isWeekend = (date: Date): boolean => {
	const day = date.getDay();
	return day === 5 || day === 6;
};

/**
 * Calculates the next available appointment date excluding weekends and holidays.
 * Skips weekends and holidays when counting days.
 *
 * @param delay - Delay string (e.g., '48 hours', '1 week', '1 month')
 * @param holidays - Array of holidays to exclude (default: empty array)
 * @returns Date object representing the next available appointment date
 */
export const calculateNextAppointmentDate = (
	delay: string,
	holidays: Holiday[] = []
): Date => {
	const today = new Date();
	let daysToAdd = 0;

	switch (delay) {
		case '48 hours':
			daysToAdd = 2;
			break;
		case '5 days':
			daysToAdd = 5;
			break;
		case '1 week':
			daysToAdd = 7;
			break;
		case '15 days':
			daysToAdd = 15;
			break;
		case '1 month':
			daysToAdd = 30;
			break;
		case '3 months':
			daysToAdd = 90;
			break;
		case '4 months':
			daysToAdd = 120;
			break;
		case '6 months':
			daysToAdd = 180;
			break;
		case '1 year':
			daysToAdd = 365;
			break;
		default:
			return today;
	}

	const nextDate = new Date(today);
	let daysAdded = 0;

	while (daysAdded < daysToAdd) {
		nextDate.setDate(nextDate.getDate() + 1);
		if (!isWeekend(nextDate) && !isHoliday(nextDate, holidays)) {
			daysAdded++;
		}
	}

	return nextDate;
};

/**
 * Loads holidays for the current year and two years ahead.
 * Fetches holidays for current year, next year, and the year after.
 *
 * @param country - Country code (default: 'DZ' for Algeria)
 * @returns Combined array of holidays for current year and two years ahead
 */
export const loadHolidays = async (
	country: string = 'DZ'
): Promise<Holiday[]> => {
	const currentYear = new Date().getFullYear();
	const nextYear = currentYear + 1;
	const thirdYear = currentYear + 2;

	try {
		const currentYearHolidays = await fetchHolidays(country, currentYear);
		const nextYearHolidays = await fetchHolidays(country, nextYear);
		const thirdYearHolidays = await fetchHolidays(country, thirdYear);

		return [...currentYearHolidays, ...nextYearHolidays, ...thirdYearHolidays];
	} catch (error) {
		console.error('Error loading holidays:', error);
		return [];
	}
};
