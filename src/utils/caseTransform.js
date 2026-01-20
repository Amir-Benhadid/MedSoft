/**
 * Case Transform Utilities
 * 
 * Provides utility functions for transforming object keys between camelCase
 * and snake_case formats. Used for converting between database (snake_case)
 * and API/frontend (camelCase) naming conventions.
 */

/**
 * Transforms snake_case object keys to camelCase recursively.
 *
 * @param obj - Object, array, or primitive value to transform
 * @returns Transformed object with camelCase keys, or original value if not an object
 */
export function toCamelCase(obj) {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) {
		return obj.map(toCamelCase);
	}
	if (typeof obj !== 'object') return obj;

	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
			letter.toUpperCase()
		);
		result[camelKey] = toCamelCase(value);
	}
	return result;
}

/**
 * Transforms camelCase object keys to snake_case recursively.
 *
 * @param obj - Object, array, or primitive value to transform
 * @returns Transformed object with snake_case keys, or original value if not an object
 */
export function toSnakeCase(obj) {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase);
	}
	if (typeof obj !== 'object') return obj;

	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = key.replace(
			/[A-Z]/g,
			(letter) => `_${letter.toLowerCase()}`
		);
		result[snakeKey] = toSnakeCase(value);
	}
	return result;
}

/**
 * Transforms database response data for API compatibility.
 * Merges original data with camelCase version of all fields.
 *
 * @param data - Database response data (object or array)
 * @returns Transformed data with camelCase fields merged
 */
export function transformDatabaseResponse(data) {
	if (!data) return data;

	if (Array.isArray(data)) {
		return data.map((item) => ({
			...item,
			...toCamelCase(item),
		}));
	}

	return {
		...data,
		...toCamelCase(data),
	};
}

/**
 * Transforms API request data for database compatibility.
 * Merges original data with snake_case version of all fields.
 *
 * @param data - API request data
 * @returns Transformed data with snake_case fields merged
 */
export function transformApiRequest(data) {
	if (!data) return data;

	return {
		...data,
		...toSnakeCase(data),
	};
}

/**
 * Field mappings for specific database tables.
 * Provides explicit mappings between camelCase and snake_case field names
 * for tables that require custom transformation logic.
 */
export const FIELD_MAPPINGS = {
	messages: {
		camelToSnake: {
			isRead: 'is_read',
		},
		snakeToCamel: {
			is_read: 'isRead',
		},
	},
	waitlist_entries: {
		camelToSnake: {
			patientId: 'patient_id',
			needsDilation: 'needs_dilation',
			isDilated: 'is_dilated',
			dilationStatus: 'dilation_status',
			dilationCompletedAt: 'dilation_completed_at',
			arrivedAt: 'arrived_at',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
		snakeToCamel: {
			patient_id: 'patientId',
			needs_dilation: 'needsDilation',
			is_dilated: 'isDilated',
			dilation_status: 'dilationStatus',
			dilation_completed_at: 'dilationCompletedAt',
			arrived_at: 'arrivedAt',
			created_at: 'createdAt',
			updated_at: 'updatedAt',
		},
	},
	appointments: {
		camelToSnake: {
			patientId: 'patient_id',
			patientName: 'patient_name',
			startTime: 'start_time',
			endTime: 'end_time',
			needsDilation: 'needs_dilation',
			isDilated: 'is_dilated',
			dilationCompletedAt: 'dilation_completed_at',
			arrivedAt: 'arrived_at',
			completedAt: 'completed_at',
			paymentInfo: 'payment_info',
			consultationType: 'consultation_type',
			groupPatientIds: 'group_patient_ids',
			isGroup: 'is_group',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		},
		snakeToCamel: {
			patient_id: 'patientId',
			patient_name: 'patientName',
			start_time: 'startTime',
			end_time: 'endTime',
			needs_dilation: 'needsDilation',
			is_dilated: 'isDilated',
			dilation_completed_at: 'dilationCompletedAt',
			arrived_at: 'arrivedAt',
			completed_at: 'completedAt',
			payment_info: 'paymentInfo',
			consultation_type: 'consultationType',
			group_patient_ids: 'groupPatientIds',
			is_group: 'isGroup',
			created_at: 'createdAt',
			updated_at: 'updatedAt',
		},
	},
};

/**
 * Transforms data for a specific table using predefined field mappings.
 *
 * @param tableName - Name of the table to transform for
 * @param data - Data object to transform
 * @param direction - Transformation direction: 'snakeToCamel' or 'camelToSnake' (default: 'snakeToCamel')
 * @returns Transformed data object, or original data if no mapping exists for the table
 */
export function transformForTable(tableName, data, direction = 'snakeToCamel') {
	if (!data || !FIELD_MAPPINGS[tableName]) return data;

	const mapping = FIELD_MAPPINGS[tableName][direction];
	const result = { ...data };

	for (const [from, to] of Object.entries(mapping)) {
		if (data[from] !== undefined) {
			result[to] = data[from];
		}
	}

	return result;
}
