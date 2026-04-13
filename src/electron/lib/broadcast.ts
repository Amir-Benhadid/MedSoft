import { BrowserWindow } from 'electron';
import { ElectronServerManager } from '../serverManager.js';

/**
 * Broadcasts a data change event to all open browser windows and connected Socket.IO clients.
 * Used to notify renderer processes when data has been modified.
 *
 * @param resource - The name of the resource that changed (e.g., 'patients', 'appointments')
 * @param id - Optional ID of the specific record that changed
 */
export function broadcastChange(resource: string, id?: string) {
    const payload = { resource, id };

    // 1. Local Electron windows via IPC
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('data-changed', payload);
        }
    });

    // 2. Network clients via Socket.IO (no-op if server not started)
    const serverManager = ElectronServerManager.getInstance();
    console.log(`🌐 [Socket.IO] Broadcasting change for: ${resource}${id ? ` (id: ${id})` : ''}`);
    serverManager.emitToClients('data-changed', payload);
}
