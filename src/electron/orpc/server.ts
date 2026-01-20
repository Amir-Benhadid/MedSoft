/**
 * oRPC Server Setup
 * 
 * Handles RPC calls from the renderer process via IPC.
 * Sets up IPC handlers to bridge communication between renderer and main process.
 */

import { ipcMain } from 'electron';
import { executeORPC } from './executor.js';

const IPC_CHANNEL = 'orpc:invoke';

/**
 * Sets up the oRPC server to handle IPC calls from renderer processes.
 * This should be called during Electron app initialization in main.ts.
 * 
 * Registers an IPC handler that receives procedure names and inputs,
 * executes them via executeORPC, and returns the results.
 */
export function setupORPCServer() {
	console.log('🔧 Setting up oRPC server...');

	ipcMain.handle(IPC_CHANNEL, async (event: any, request: { procedure: string; input: any }) => {
		return await executeORPC(request.procedure, request.input);
	});

	console.log('✅ oRPC server setup complete');
}

