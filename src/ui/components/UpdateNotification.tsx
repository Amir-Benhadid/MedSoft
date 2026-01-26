import { useEffect, useRef } from 'react';
import { useToast } from '@/ui/hooks/use-toast';
import { ToastAction } from '@/ui/components/ui/toast';

export function UpdateNotification() {
    const { toast, dismiss } = useToast();
    const downloadToastIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!window.electronAPI) return;

        // Cleanup function for listeners
        const cleanups: Array<() => void> = [];

        // Update Available
        const removeUpdateAvailable = window.electronAPI.onUpdateAvailable((info) => {
            console.log('Update available:', info);
            const { id, update } = toast({
                title: 'Update Available',
                description: 'A new version is available. Downloading now...',
                duration: 1000000, // Keep open
            });
            downloadToastIdRef.current = id;
        });
        cleanups.push(removeUpdateAvailable);

        // Download Progress
        const removeDownloadProgress = window.electronAPI.onDownloadProgress((progress) => {
            if (downloadToastIdRef.current) {
                // We can't update using the hook directly without the update function from the specific toast call
                // But we can just dismiss and show new, or simpler: just show a generic "Downloading" and wait for completion.
                // Since use-toast implementation is simple, updating might be tricky without the specific `update` function returned from `toast()`.
                // However, `useToast` exposes `update` via dispatch? No, only `useToast` returns state and global helpers.
                // Actually `toast()` returns `{ id, update, dismiss }`.
                // Since we are inside the callback, we don't have access to the *specific* update function from the *previous* render's toast call easily unless we store it.
                // But storing functions in refs is fine.
            }
        });
        cleanups.push(removeDownloadProgress);

        // Update Downloaded
        const removeUpdateDownloaded = window.electronAPI.onUpdateDownloaded((info) => {
            console.log('Update downloaded:', info);

            // Dismiss downloading toast if it exists
            if (downloadToastIdRef.current) {
                dismiss(downloadToastIdRef.current);
                downloadToastIdRef.current = null;
            }

            toast({
                title: 'Update Ready',
                description: 'Version ' + info.version + ' is ready to install.',
                duration: 3000000, // Indefinite
                action: (
                    <ToastAction
                        altText="Restart Now"
                        onClick={() => {
                            window.electronAPI.quitAndInstall();
                        }}
                    >
                        Restart Now
                    </ToastAction>
                ),
            });
        });
        cleanups.push(removeUpdateDownloaded);

        // Update Error
        const removeUpdateError = window.electronAPI.onUpdateError((err) => {
            console.error('Update error:', err);
            if (downloadToastIdRef.current) {
                dismiss(downloadToastIdRef.current);
                downloadToastIdRef.current = null;
            }
            // Optional: Show error toast
            // toast({
            // 	title: 'Update Failed',
            // 	description: 'Failed to download update.',
            // 	variant: 'destructive',
            // });
        });
        cleanups.push(removeUpdateError);

        return () => {
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [toast, dismiss]);

    return null;
}
