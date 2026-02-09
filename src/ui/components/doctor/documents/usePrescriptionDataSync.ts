import { useCallback, useEffect, useRef } from 'react';
import { PrescriptionData } from './types';

interface UsePrescriptionDataSyncProps {
	prescriptionData: PrescriptionData;
	setPrescriptionData: (data: PrescriptionData | ((prev: PrescriptionData) => PrescriptionData)) => void;
	printData: PrescriptionData;
	setPrintData: (data: PrescriptionData | ((prev: PrescriptionData) => PrescriptionData)) => void;
}

/**
 * Custom hook for smooth prescription data synchronization
 * - Immediate updates for both form and preview (real-time sync)
 * - Optimized to prevent unnecessary re-renders
 */
export const usePrescriptionDataSync = ({
	prescriptionData,
	setPrescriptionData,
	printData,
	setPrintData,
}: UsePrescriptionDataSyncProps) => {
	// Optimized handler that updates both form and preview immediately
	const handlePrescriptionDataChange = useCallback((
		updater: PrescriptionData | ((prev: PrescriptionData) => PrescriptionData)
	) => {
		// Update both form and preview state immediately for real-time sync
		setPrescriptionData(updater);
		setPrintData(updater);
	}, [setPrescriptionData, setPrintData]);

	return {
		handlePrescriptionDataChange,
	};
};