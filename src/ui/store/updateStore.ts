import { create } from 'zustand';

interface UpdateState {
    status: 'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'error';
    progress: number; // 0-100
    version: string | null;
    error: string | null;

    // Actions
    setStatus: (status: UpdateState['status']) => void;
    setProgress: (progress: number) => void;
    setVersion: (version: string) => void;
    setError: (error: string) => void;
    reset: () => void;

    // Async actions
    checkForUpdates: () => void;
    quitAndInstall: () => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
    status: 'idle',
    progress: 0,
    version: null,
    error: null,

    setStatus: (status) => set({ status }),
    setProgress: (progress) => set({ progress }),
    setVersion: (version) => set({ version }),
    setError: (error) => set({ error, status: 'error' }),
    reset: () => set({ status: 'idle', progress: 0, version: null, error: null }),

    checkForUpdates: () => {
        if (window.electronAPI) {
            // In a real app we might trigger a check, but here we mostly listen
            // However, listeners are set up in UpdateNotification.tsx (or we can move them here)
            // For now, let's keep listener setup separate or triggered by the main component
        }
    },

    quitAndInstall: () => {
        if (window.electronAPI) {
            window.electronAPI.quitAndInstall();
        }
    }
}));
