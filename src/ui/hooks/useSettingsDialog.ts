/**
 * Settings Dialog State Management
 * 
 * Manages the state and interactions for the settings dialog.
 * Handles PIN updates with validation and confirmation.
 */

import { useState } from 'react';
import { useUpdatePin } from './useAuth';

/**
 * Hook for managing settings dialog state and PIN updates
 * 
 * @param {Function} [onSuccess] - Optional callback to execute after successful PIN update
 * @returns {Object} Settings dialog state and control functions
 * @returns {boolean} isOpen - Whether the dialog is open
 * @returns {Function} setIsOpen - Function to set dialog open state
 * @returns {string} newPin - New PIN value
 * @returns {Function} setNewPin - Function to update new PIN value
 * @returns {string} confirmPin - Confirmation PIN value
 * @returns {Function} setConfirmPin - Function to update confirmation PIN
 * @returns {boolean} showNewPin - Whether to show the new PIN (vs masked)
 * @returns {Function} setShowNewPin - Function to toggle new PIN visibility
 * @returns {boolean} showConfirmPin - Whether to show the confirmation PIN (vs masked)
 * @returns {Function} setShowConfirmPin - Function to toggle confirmation PIN visibility
 * @returns {number} tab - Current tab index
 * @returns {Function} setTab - Function to change tab
 * @returns {Function} openDialog - Function to open the dialog
 * @returns {Function} closeDialog - Function to close the dialog
 * @returns {Function} handlePinUpdate - Function to update the PIN
 * @returns {boolean} isLoading - Whether PIN update is in progress
 */
export function useSettingsDialog(onSuccess?: () => void) {
	const [isOpen, setIsOpen] = useState(false);
	const [newPin, setNewPin] = useState('');
	const [confirmPin, setConfirmPin] = useState('');
	const [showNewPin, setShowNewPin] = useState(false);
	const [showConfirmPin, setShowConfirmPin] = useState(false);
	const [tab, setTab] = useState(0);

	const updatePinMutation = useUpdatePin();

	const openDialog = () => {
		setIsOpen(true);
		setNewPin('');
		setConfirmPin('');
		setShowNewPin(false);
		setShowConfirmPin(false);
		setTab(0);
	};

	const closeDialog = () => {
		setIsOpen(false);
		setNewPin('');
		setConfirmPin('');
		setShowNewPin(false);
		setShowConfirmPin(false);
		setTab(0);
	};

	const handlePinUpdate = async () => {
		if (newPin.length < 4) {
			return;
		}

		try {
			const params = { newPin, confirmPin };
			await updatePinMutation.mutateAsync(params);
			setTimeout(() => {
				closeDialog();
				if (onSuccess) onSuccess();
			}, 2000);
		} catch {
			// Error handled by mutation
		}
	};

	return {
		isOpen,
		setIsOpen,
		newPin,
		setNewPin,
		confirmPin,
		setConfirmPin,
		showNewPin,
		setShowNewPin,
		showConfirmPin,
		setShowConfirmPin,
		tab,
		setTab,
		openDialog,
		closeDialog,
		handlePinUpdate,
		isLoading: updatePinMutation.isPending,
	};
}

