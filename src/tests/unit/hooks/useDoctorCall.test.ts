import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDoctorCall } from '@/ui/hooks/useDoctorCall';
import { playBeep } from '@/ui/lib/sound';

// Mock playBeep
vi.mock('@/ui/lib/sound', () => ({
    playBeep: vi.fn(),
}));

describe('useDoctorCall hook', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should initialize to false by default', () => {
        const { result } = renderHook(() => useDoctorCall());
        expect(result.current.isCalling).toBe(false);
    });

    it('should initialize to true if localStorage has the active flag', () => {
        localStorage.setItem('doctor_call_active', 'true');
        const { result } = renderHook(() => useDoctorCall());
        expect(result.current.isCalling).toBe(true);
    });

    it('should update state and localStorage on callSecretary', () => {
        const { result } = renderHook(() => useDoctorCall());
        
        act(() => {
            result.current.callSecretary();
        });

        expect(result.current.isCalling).toBe(true);
        expect(localStorage.getItem('doctor_call_active')).toBe('true');
    });

    it('should update state and localStorage on cancelCall', () => {
        localStorage.setItem('doctor_call_active', 'true');
        const { result } = renderHook(() => useDoctorCall());

        act(() => {
            result.current.cancelCall();
        });

        expect(result.current.isCalling).toBe(false);
        expect(localStorage.getItem('doctor_call_active')).toBe('false');
    });

    it('should play beeps continuously on an interval when isCalling and playSound are true', () => {
        const { result } = renderHook(() => useDoctorCall({ playSound: true }));

        act(() => {
            result.current.callSecretary();
        });

        // playCallBeep immediately schedules double beep:
        // 1st playBeep is called immediately
        // 2nd playBeep is called after 150ms timeout
        expect(playBeep).toHaveBeenCalledTimes(1);
        
        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(playBeep).toHaveBeenCalledTimes(2);

        // Next interval fires at 2000ms:
        // 3rd playBeep called immediately when interval runs
        act(() => {
            vi.advanceTimersByTime(1850); // total 2000ms from start
        });
        expect(playBeep).toHaveBeenCalledTimes(3);

        // 4th playBeep after 150ms timeout of the second interval iteration
        act(() => {
            vi.advanceTimersByTime(150); // total 2150ms from start
        });
        expect(playBeep).toHaveBeenCalledTimes(4);
    });

    it('should NOT play beeps if playSound is false', () => {
        const { result } = renderHook(() => useDoctorCall({ playSound: false }));

        act(() => {
            result.current.callSecretary();
        });

        expect(playBeep).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(3000);
        });
        expect(playBeep).not.toHaveBeenCalled();
    });
});
