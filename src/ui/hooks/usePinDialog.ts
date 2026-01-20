/**
 * PIN Dialog State Management
 * 
 * Manages the state and interactions for the PIN entry dialog.
 * Handles PIN verification, error states, and navigation after successful verification.
 */

import { useState } from 'react';
import { useVerifyPin } from './useAuth';
import { useNavigation } from './useNavigation';

/**
 * Hook for managing PIN dialog state and interactions
 * 
 * @param {Function} [onSettingsSuccess] - Optional callback to execute after successful PIN verification for settings access
 * @returns {Object} PIN dialog state and control functions
 * @returns {boolean} isOpen - Whether the dialog is open
 * @returns {string} pin - Current PIN value
 * @returns {Function} setPin - Function to update PIN value
 * @returns {boolean} showPin - Whether to show the PIN (vs masked)
 * @returns {Function} setShowPin - Function to toggle PIN visibility
 * @returns {string} error - Error message if verification fails
 * @returns {'doctor' | 'settings'} purpose - Purpose of the PIN dialog
 * @returns {Function} openDialog - Function to open the dialog with a purpose
 * @returns {Function} closeDialog - Function to close the dialog
 * @returns {Function} handleSubmit - Function to submit and verify the PIN
 * @returns {Function} handleKeyPress - Function to handle Enter key press
 * @returns {boolean} isLoading - Whether PIN verification is in progress
 */
export function usePinDialog(onSettingsSuccess?: () => void) {
	const [isOpen, setIsOpen] = useState(false);
	const [pin, setPin] = useState('');
	const [showPin, setShowPin] = useState(false);
	const [error, setError] = useState('');
	const [purpose, setPurpose] = useState<'doctor' | 'settings'>('doctor');

	const verifyPinMutation = useVerifyPin();
	const { goToDoctor } = useNavigation();

	const openDialog = (dialogPurpose: 'doctor' | 'settings') => {
		setPurpose(dialogPurpose);
		setIsOpen(true);
		setPin('');
		setError('');
		setShowPin(false);
	};

	const closeDialog = () => {
		setIsOpen(false);
		setPin('');
		setError('');
		setShowPin(false);
	};

	const handleSubmit = async () => {
		if (!pin) {
			setError('Veuillez saisir un code PIN');
			return;
		}

		try {
			const result = await verifyPinMutation.mutateAsync(pin);

			if (result.valid) {
				closeDialog();

				if (purpose === 'doctor') {
					goToDoctor();
				} else if (purpose === 'settings' && onSettingsSuccess) {
					onSettingsSuccess();
				}
			} else {
				setError('Code PIN incorrect');
				setPin('');
			}
		} catch {
			setError('Erreur lors de la vérification');
			setPin('');
		}
	};

	const handleKeyPress = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	};

	return {
		isOpen,
		pin,
		setPin,
		showPin,
		setShowPin,
		error,
		purpose,
		openDialog,
		closeDialog,
		handleSubmit,
		handleKeyPress,
		isLoading: verifyPinMutation.isPending,
	};
}

