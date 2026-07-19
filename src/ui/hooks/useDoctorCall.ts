import { useState, useEffect } from 'react';
import { playBeep } from '@/ui/lib/sound';

const STORAGE_KEY = 'doctor_call_active';

export interface UseDoctorCallOptions {
    playSound?: boolean;
}

export function useDoctorCall(options?: UseDoctorCallOptions) {
    const playSound = options?.playSound ?? true;
    const [isCalling, setIsCalling] = useState(false);

    useEffect(() => {
        let prevStatus = localStorage.getItem(STORAGE_KEY) === 'true';
        setIsCalling(prevStatus);

        // Initial check
        const checkStatus = () => {
            const status = localStorage.getItem(STORAGE_KEY) === 'true';
            prevStatus = status;
            setIsCalling(status);
        };

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

    // Play beep sound continuously while calling bell is active
    useEffect(() => {
        if (!isCalling || !playSound) return;

        const playCallBeep = () => {
            playBeep(880, 0.15);
            setTimeout(() => playBeep(880, 0.15), 150);
        };

        // Play initial beep immediately
        playCallBeep();

        // Repeat every 2 seconds
        const intervalId = setInterval(playCallBeep, 2000);

        return () => {
            clearInterval(intervalId);
        };
    }, [isCalling, playSound]);

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
