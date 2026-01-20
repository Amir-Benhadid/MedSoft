import { BrowserWindow } from 'electron';

/**
 * Broadcasts a data change event to all open browser windows.
 * Used to notify renderer processes when data has been modified.
 *
 * @param resource - The name of the resource that changed (e.g., 'patients', 'appointments')
 */
export function broadcastChange(resource: string) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('data-changed', resource);
        }
    });
}
