/**
 * oRPC Client Setup
 * Creates a linked client that chooses between IPC and HTTP transport based on config
 */

import { createORPCClient } from '@orpc/client';
import { createIPCTransport } from './ipc-transport';
import type { AppClient } from '../../../electron/orpc/router';

// We need a transport that can dynamically switch or determine mode at start
// Since this is a client-side file, we can check the window.electronAPI.checkSetup() result
// or assume we are in the right mode if the app is loaded.

// HOWEVER: ClientLink is an object with a `call` method, not a function.
const lazyLink = {
    call: async (path: readonly string[], input: unknown, context: any) => {
        // 1. Get Config (Cached or fresh)
        // We assume checkSetup is fast enough or we could cache it in a variable outside
        const { config } = await window.electronAPI.checkSetup();

        // 2. Decide Transport
        if (config.serverMode === 'client' && config.serverIP) {
            // HTTP Transport
            const procedure = path.join('.');
            const url = `http://${config.serverIP}:${config.serverPort || 3001}/api/rpc`;

            // Manual fetch implementation for ORPC
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ procedure, input }),
                ...context // Pass context if needed, though fetch opt are specific
            });

            if (!response.ok) {
                try {
                    const errErr = await response.json();
                    throw new Error(errErr.error?.message || `RPC Error: ${response.statusText}`);
                } catch (e: any) {
                    if (e.message.startsWith('RPC Error')) throw e;
                    throw new Error(`RPC Error: ${response.statusText}`);
                }
            }

            const json = await response.json();
            return json.data; // RPC wrapper returns { data: ... }
        } else {
            // IPC Transport (Default for Host)
            const ipcLink = createIPCTransport();
            return ipcLink.call(path, input, context);
        }
    }
};

// Create the typed oRPC client using the lazy link
export const orpcClient = createORPCClient<AppClient>(lazyLink);
