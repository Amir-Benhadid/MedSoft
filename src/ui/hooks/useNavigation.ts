/**
 * Navigation Hooks
 * 
 * Provides convenient navigation functions for common routes in the application.
 * Wraps TanStack Router's navigate function with predefined route handlers.
 */

import { useNavigate } from '@tanstack/react-router';

/**
 * Hook that provides navigation functions for common routes
 * 
 * @returns {Object} Navigation functions
 * @returns {Function} goToSecretary - Navigate to secretary dashboard
 * @returns {Function} goToDoctor - Navigate to doctor dashboard
 * @returns {Function} goToLanding - Navigate to landing page
 */
export function useNavigation() {
	const navigate = useNavigate();

	const goToSecretary = () => {
		navigate({ to: '/secretary' });
	};

	const goToDoctor = () => {
		navigate({ to: '/doctor' });
	};

	const goToLanding = () => {
		navigate({ to: '/' });
	};

	return {
		goToSecretary,
		goToDoctor,
		goToLanding,
	};
}

