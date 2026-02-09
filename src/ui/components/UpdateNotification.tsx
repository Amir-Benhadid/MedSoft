import { useEffect } from 'react';
import { useUpdateStore } from '@/ui/store/updateStore';

export function UpdateNotification() {
    const { setStatus, setProgress, setVersion, setError } = useUpdateStore();


    // removed simulation code

    useEffect(() => {
        if (!window.electronAPI) return;

        // Cleanup function for listeners
        const cleanups: Array<() => void> = [];

        // Update Available
        const removeUpdateAvailable = window.electronAPI.onUpdateAvailable((info) => {
            console.log('Update available:', info);
            setStatus('available');
            if (info.version) setVersion(info.version);
        });
        cleanups.push(removeUpdateAvailable);

        // Download Progress
        const removeDownloadProgress = window.electronAPI.onDownloadProgress((progress) => {
            setStatus('downloading');
            // Assuming progress object has percent
            if (progress && typeof progress.percent === 'number') {
                setProgress(progress.percent);
            }
        });
        cleanups.push(removeDownloadProgress);

        // Update Downloaded
        const removeUpdateDownloaded = window.electronAPI.onUpdateDownloaded((info) => {
            console.log('Update downloaded:', info);
            setStatus('ready');
            if (info.version) setVersion(info.version);
        });
        cleanups.push(removeUpdateDownloaded);

        // Update Error
        const removeUpdateError = window.electronAPI.onUpdateError((err) => {
            console.error('Update error:', err);
            setError(err.message || 'Unknown error');
        });
        cleanups.push(removeUpdateError);

        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [setStatus, setProgress, setVersion, setError]);

    return null;
}
