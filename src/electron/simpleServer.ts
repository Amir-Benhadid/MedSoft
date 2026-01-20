import http from 'http';
import { URL } from 'url';

/**
 * A simple embedded HTTP server with minimal functionality.
 * Provides basic health check and server info endpoints.
 * Uses singleton pattern to ensure only one server instance exists.
 */
export class SimpleEmbeddedServer {
	private static instance: SimpleEmbeddedServer;
	private server: http.Server | null = null;
	private isRunning = false;
	private port = 3001;

	private constructor() {}

	/**
	 * Gets the singleton instance of SimpleEmbeddedServer.
	 *
	 * @returns The SimpleEmbeddedServer instance
	 */
	public static getInstance(): SimpleEmbeddedServer {
		if (!SimpleEmbeddedServer.instance) {
			SimpleEmbeddedServer.instance = new SimpleEmbeddedServer();
		}
		return SimpleEmbeddedServer.instance;
	}

	/**
	 * Starts the simple embedded HTTP server.
	 *
	 * @returns Promise resolving to an object with success status, optional port, and optional error message
	 */
	public async startServer(): Promise<{
		success: boolean;
		port?: number;
		error?: string;
	}> {
		if (this.isRunning) {
			return { success: true, port: this.port };
		}

		try {
			console.log('🚀 Starting simple embedded server...');

			this.server = http.createServer((req, res) => {
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader(
					'Access-Control-Allow-Methods',
					'GET, POST, PUT, DELETE, OPTIONS'
				);
				res.setHeader(
					'Access-Control-Allow-Headers',
					'Content-Type, Authorization'
				);

				if (req.method === 'OPTIONS') {
					res.writeHead(200);
					res.end();
					return;
				}

				const url = new URL(req.url || '', `http://localhost:${this.port}`);

				if (url.pathname === '/api/health') {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							status: 'OK',
							message: 'Simple embedded server is running',
							timestamp: new Date().toISOString(),
						})
					);
				} else if (url.pathname === '/api/server-info') {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							name: 'Cabinet Medical Server (Simple)',
							version: '1.0.0',
							status: 'online',
							embedded: true,
							simple: true,
						})
					);
				} else {
					res.writeHead(404, { 'Content-Type': 'application/json' });
					res.end(
						JSON.stringify({
							error: 'Not Found',
							message: 'Simple server - endpoint not implemented',
						})
					);
				}
			});

			await new Promise<void>((resolve, reject) => {
				this.server?.listen(this.port, () => {
					console.log(
						`✅ Simple embedded server running on http://localhost:${this.port}`
					);
					this.isRunning = true;
					resolve();
				});

				this.server?.on('error', (error) => {
					console.error('❌ Simple server startup error:', error);
					reject(error);
				});
			});

			return { success: true, port: this.port };
		} catch (error) {
			console.error('Error starting simple embedded server:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Stops the simple embedded server.
	 *
	 * @returns Promise resolving to an object with success status and optional error message
	 */
	public async stopServer(): Promise<{ success: boolean; error?: string }> {
		if (!this.server || !this.isRunning) {
			return { success: true };
		}

		try {
			await new Promise<void>((resolve, reject) => {
				this.server?.close((error) => {
					if (error) {
						reject(error);
					} else {
						resolve();
					}
				});
			});

			this.server = null;
			this.isRunning = false;
			console.log('✅ Simple embedded server stopped');
			return { success: true };
		} catch (error) {
			console.error('Error stopping simple embedded server:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Checks if the server is currently running.
	 *
	 * @returns True if running, false otherwise
	 */
	public isServerRunning(): boolean {
		return this.isRunning;
	}

	/**
	 * Cleans up resources when the app exits.
	 * Stops the server if it's running.
	 */
	public cleanup(): void {
		if (this.isRunning) {
			console.log('🧹 Cleaning up simple embedded server...');
			this.stopServer().catch(console.error);
		}
	}
}
