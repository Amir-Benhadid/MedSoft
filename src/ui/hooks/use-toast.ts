/**
 * Toast Notification Hook
 * 
 * Provides a toast notification system for displaying temporary messages
 * to users. Supports adding, updating, dismissing, and removing toasts
 * with automatic cleanup after a delay.
 */

import * as React from 'react';
import type { ToastActionElement, ToastProps } from '@/ui/components/ui/toast';

/** Maximum number of toasts that can be displayed simultaneously */
const TOAST_LIMIT = 1;

/** Delay in milliseconds before automatically removing a dismissed toast */
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
	id: string;
	title?: React.ReactNode;
	description?: React.ReactNode;
	action?: ToastActionElement;
};

const actionTypes = {
	ADD_TOAST: 'ADD_TOAST',
	UPDATE_TOAST: 'UPDATE_TOAST',
	DISMISS_TOAST: 'DISMISS_TOAST',
	REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

/** Counter for generating unique toast IDs */
let count = 0;

/**
 * Generates a unique ID for a toast notification
 * @returns {string} Unique toast ID
 */
function genId() {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
	| {
		type: ActionType['ADD_TOAST'];
		toast: ToasterToast;
	}
	| {
		type: ActionType['UPDATE_TOAST'];
		toast: Partial<ToasterToast>;
	}
	| {
		type: ActionType['DISMISS_TOAST'];
		toastId?: ToasterToast['id'];
	}
	| {
		type: ActionType['REMOVE_TOAST'];
		toastId?: ToasterToast['id'];
	};

interface State {
	toasts: ToasterToast[];
}

/** Map of toast IDs to their removal timeout handlers */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules a toast for removal after the configured delay
 * @param {string} toastId - ID of the toast to schedule for removal
 */
const addToRemoveQueue = (toastId: string) => {
	if (toastTimeouts.has(toastId)) {
		return;
	}

	const timeout = setTimeout(() => {
		toastTimeouts.delete(toastId);
		dispatch({
			type: 'REMOVE_TOAST',
			toastId: toastId,
		});
	}, TOAST_REMOVE_DELAY);

	toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer function for managing toast state
 * Handles adding, updating, dismissing, and removing toasts
 * 
 * @param {State} state - Current toast state
 * @param {Action} action - Action to perform
 * @returns {State} New toast state
 */
export const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'ADD_TOAST':
			return {
				...state,
				toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
			};

		case 'UPDATE_TOAST':
			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === action.toast.id ? { ...t, ...action.toast } : t
				),
			};

		case 'DISMISS_TOAST': {
			const { toastId } = action;

			if (toastId) {
				addToRemoveQueue(toastId);
			} else {
				state.toasts.forEach((toast) => {
					addToRemoveQueue(toast.id);
				});
			}

			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === toastId || toastId === undefined
						? {
							...t,
							open: false,
						}
						: t
				),
			};
		}
		case 'REMOVE_TOAST':
			if (action.toastId === undefined) {
				return {
					...state,
					toasts: [],
				};
			}
			return {
				...state,
				toasts: state.toasts.filter((t) => t.id !== action.toastId),
			};
	}
};

/** Array of state change listeners */
const listeners: Array<(state: State) => void> = [];

/** In-memory state store for toasts */
let memoryState: State = { toasts: [] };

/**
 * Dispatches an action to update toast state and notifies all listeners
 * @param {Action} action - Action to dispatch
 */
function dispatch(action: Action) {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => {
		listener(memoryState);
	});
}

/** Toast configuration without the ID (ID is generated automatically) */
type Toast = Omit<ToasterToast, 'id'>;

/**
 * Creates and displays a new toast notification
 * 
 * @param {Toast} props - Toast configuration (title, description, variant, etc.)
 * @returns {Object} Toast control object with id, dismiss, and update methods
 * 
 * @example
 * ```tsx
 * const { toast } = useToast();
 * 
 * toast({
 *   title: 'Success',
 *   description: 'Operation completed successfully',
 *   variant: 'default'
 * });
 * ```
 */
function toast({ ...props }: Toast) {
	const id = genId();

	/**
	 * Updates the toast with new properties
	 * @param {ToasterToast} props - New toast properties
	 */
	const update = (props: ToasterToast) =>
		dispatch({
			type: 'UPDATE_TOAST',
			toast: { ...props, id },
		});

	/**
	 * Dismisses the toast
	 */
	const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

	dispatch({
		type: 'ADD_TOAST',
		toast: {
			...props,
			id,
			open: true,
			onOpenChange: (open) => {
				if (!open) dismiss();
			},
		},
	});

	return {
		id: id,
		dismiss,
		update,
	};
}

/**
 * Hook for accessing and managing toast notifications
 * 
 * @returns {Object} Toast state and control functions
 * @returns {ToasterToast[]} toasts - Array of current toasts
 * @returns {Function} toast - Function to create a new toast
 * @returns {Function} dismiss - Function to dismiss a toast by ID (or all if no ID provided)
 * 
 * @example
 * ```tsx
 * const { toast, dismiss } = useToast();
 * 
 * // Show a toast
 * const toastId = toast({ title: 'Hello', description: 'World' });
 * 
 * // Dismiss specific toast
 * dismiss(toastId.id);
 * 
 * // Dismiss all toasts
 * dismiss();
 * ```
 */
function useToast() {
	const [state, setState] = React.useState<State>(memoryState);

	React.useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, [state]);

	return {
		...state,
		toast,
		dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
	};
}

export { useToast, toast };

