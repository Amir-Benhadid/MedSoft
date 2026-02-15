import { BrowserWindow } from 'electron';
import { ElectronServerManager } from '../serverManager.js';

/**
 * Broadcasts a data change event to all open browser windows and connected Socket.IO clients.
 * Used to notify renderer processes when data has been modified.
 *
 * @param resource - The name of the resource that changed (e.g., 'patients', 'appointments')
 */
export function broadcastChange(resource: string) {
    // 1. Local Electron Windows (via IPC)
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => {
        if (!win.isDestroyed()) {
            win.webContents.send('data-changed', resource);
        }
    });

    // 2. Network Clients (via Socket.IO)
    const serverManager = ElectronServerManager.getInstance();
    serverManager.startServer().then(() => {
        // Emit via Socket.IO if available
        // @ts-ignore - Accessing io which is private but we might need to expose it or add an emit method
        if (serverManager['io']) {
            console.log(`🌐 [Socket.IO] Broadcasting change for: ${resource}`);
            // @ts-ignore
            serverManager['io'].emit('data-changed', resource);
        }
    }).catch(err => {
        console.error('❌ Failed to broadcast via Socket.IO:', err);
    });
}
