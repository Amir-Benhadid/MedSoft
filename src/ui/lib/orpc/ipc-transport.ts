/**
 * IPC Transport for oRPC
 * This transport allows oRPC to work over Electron IPC instead of HTTP
 */

import type { ClientLink } from '@orpc/client';



const IPC_CHANNEL = 'orpc:invoke';

/**
 * Creates an IPC transport for oRPC client
 * This transport sends RPC calls via Electron IPC to the main process
 */
export function createIPCTransport(): ClientLink<Record<string, unknown>> {
	return {
		call: async (path: readonly string[], input: unknown) => {
			// Check if we're in Electron
			if (!window.electronAPI) {
				throw new Error(
					'IPC transport requires Electron API. Make sure preload script exposes electronAPI.invoke'
				);
			}

			try {
				// Convert path array to procedure string (e.g., ["auth", "verifyPin"] -> "auth.verifyPin")
				const procedure = path.join('.');

				// Send the RPC request via IPC
				const response = await window.electronAPI.invoke(IPC_CHANNEL, {
					procedure,
					input,
				});

				// Handle errors
				if (response && typeof response === 'object' && 'error' in response && response.error) {
					throw new Error(
						(response.error as { message?: string }).message || 'RPC call failed'
					);
				}

				return (response as { data: unknown }).data;
			} catch (error) {
				console.error('IPC transport error:', error);
				throw error;
			}
		},
	};
}

