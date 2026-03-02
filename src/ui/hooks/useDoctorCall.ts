import { useState, useEffect } from 'react';

const STORAGE_KEY = 'doctor_call_active';

export function useDoctorCall() {
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        // Initial check
        const checkStatus = () => {
            const status = localStorage.getItem(STORAGE_KEY) === 'true';
            setIsCalling(status);
        };
        checkStatus();

        // Listen for internal updates (from this same window/hook usage)
        const handleLocalUpdate = () => checkStatus();
        window.addEventListener('doctor-call-update', handleLocalUpdate);

        // Listen for external updates (other tabs/windows)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                checkStatus();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('doctor-call-update', handleLocalUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const callSecretary = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        // Dispatch local event for same-window updates
        window.dispatchEvent(new Event('doctor-call-update'));
        // Also dispatch storage event manually for some environments if needed, 
        // though standard storage event is browser-handled for other windows.
    };

    const cancelCall = () => {
        localStorage.setItem(STORAGE_KEY, 'false');
        window.dispatchEvent(new Event('doctor-call-update'));
    };

    const toggleCall = () => {
        if (isCalling) {
            cancelCall();
        } else {
            callSecretary();
        }
    };

    return { isCalling, callSecretary, cancelCall, toggleCall };
}
