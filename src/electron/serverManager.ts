import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { executeORPC } from './orpc/executor.js';
import { ServiceBroadcaster } from './utils/discovery.js';

/**
 * Manages the embedded HTTP server running within the Electron main process.
 * Provides RPC endpoints and Socket.IO for real-time communication.
 * Uses singleton pattern to ensure only one server instance exists.
 */
export class ElectronServerManager {
	private static instance: ElectronServerManager;
	private server: http.Server | null = null;
	private expressApp: express.Application | null = null;
	private io: Server | null = null;
	private broadcaster: ServiceBroadcaster | null = null;
	private isStarting = false;
	private isRunning = false;

	private constructor() {
		dotenv.config();
	}

	/**
	 * Gets the singleton instance of ElectronServerManager.
	 *
	 * @returns The ElectronServerManager instance
	 */
	public static getInstance(): ElectronServerManager {
		if (!ElectronServerManager.instance) {
			ElectronServerManager.instance = new ElectronServerManager();
		}
		return ElectronServerManager.instance;
	}

	/**
	 * Starts the embedded HTTP server with Express and Socket.IO.
	 * Sets up CORS, JSON parsing, and RPC endpoints.
	 *
	 * @param serverName - Name of the server for network discovery (default: 'Cabinet Server')
	 * @returns Promise resolving to an object with success status, optional port, and optional error message
	 */
	public async startServer(serverName: string = 'Cabinet Server'): Promise<{
		success: boolean;
		port?: number;
		error?: string;
	}> {
		if (this.isRunning) {
			console.log('Server is already running');
			return { success: true, port: 3001 };
		}

		if (this.isStarting) {
			console.log('Server is already starting');
			return { success: false, error: 'Server is already starting' };
		}

		this.isStarting = true;

		try {
			console.log('🚀 Starting embedded server in Electron process...');

			this.expressApp = express();
			const PORT = process.env.PORT || 3001;

			this.expressApp.use(
				cors({
					origin: true,
					credentials: true,
				})
			);
			this.expressApp.use(express.json());
			this.expressApp.use(express.urlencoded({ extended: true }));

			this.server = http.createServer(this.expressApp);

			this.io = new Server(this.server, {
				cors: {
					origin: "*",
					methods: ['GET', 'POST'],
					credentials: true,
				},
			});

			await this.setupRoutes();

			await new Promise<void>((resolve, reject) => {
				this.server?.listen(PORT, () => {
					console.log(`✅ Embedded server running on http://localhost:${PORT}`);
					console.log('🔌 Socket.IO enabled for real-time updates');
					this.isRunning = true;
					this.isStarting = false;

					try {
						this.broadcaster = new ServiceBroadcaster(serverName, Number(PORT));
						this.broadcaster.start();
					} catch (e) {
						console.error('Failed to start service broadcaster:', e);
					}

					resolve();
				});

				this.server?.on('error', (error) => {
					console.error('❌ Server startup error:', error);
					this.isStarting = false;
					reject(error);
				});
			});

			return { success: true, port: Number(PORT) };
		} catch (error) {
			this.isStarting = false;
			console.error('Error starting embedded server:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Stops the embedded server gracefully.
	 * Closes Socket.IO connections, stops the broadcaster, and closes the HTTP server.
	 *
	 * @returns Promise resolving to an object with success status and optional error message
	 */
	public async stopServer(): Promise<{ success: boolean; error?: string }> {
		if (!this.server || !this.isRunning) {
			console.log('Server is not running');
			return { success: true };
		}

		try {
			console.log('🛑 Stopping embedded server...');

			if (this.broadcaster) {
				this.broadcaster.stop();
				this.broadcaster = null;
			}

			if (this.io) {
				this.io.close();
				this.io = null;
			}

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
			this.expressApp = null;
			this.isRunning = false;

			console.log('✅ Embedded server stopped successfully');
			return { success: true };
		} catch (error) {
			console.error('Error stopping embedded server:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Checks if the server is currently running.
	 *
	 * @returns Promise resolving to true if running, false otherwise
	 */
	public async isServerRunning(): Promise<boolean> {
		return this.isRunning;
	}

	/**
	 * Sets up Express routes for the embedded server.
	 * Configures health check, server info, and RPC endpoints.
	 */
	private async setupRoutes(): Promise<void> {
		if (!this.expressApp) return;

		this.expressApp.get('/api/health', (req, res) => {
			res.status(200).json({
				status: 'OK',
				message: 'Embedded server is running',
				timestamp: new Date().toISOString(),
			});
		});

		this.expressApp.get('/api/server-info', async (req, res) => {
			try {
				const os = await import('os');
				res.status(200).json({
					name: 'Cabinet Medical Server (Embedded)',
					version: '1.0.0',
					hostname: os.hostname(),
					timestamp: new Date().toISOString(),
					status: 'online',
					embedded: true,
				});
			} catch (error) {
				console.error('Server info error:', error);
				res.status(200).json({
					name: 'Cabinet Medical Server (Embedded)',
					version: '1.0.0',
					status: 'online',
					embedded: true,
				});
			}
		});

		this.expressApp.post('/api/rpc', async (req, res) => {
			try {
				const { procedure, input } = req.body;

				if (!procedure) {
					res.status(400).json({ error: { message: 'Procedure is required' } });
					return;
				}

				const result = await executeORPC(procedure, input);
				res.json(result);

			} catch (error: any) {
				console.error('RPC Error:', error);
				res.status(500).json({
					data: null,
					error: {
						message: error.message || 'Internal RPC Error',
						code: 'INTERNAL_ERROR'
					}
				});
			}
		});

		this.expressApp.use(
			(
				err: Error,
				req: express.Request,
				res: express.Response,
				_next: express.NextFunction
			) => {
				console.error('Server error:', err);
				res.status(500).json({
					message: 'Internal server error',
					error: err.message,
				});
			}
		);

		console.log('📝 RPC Route configured on /api/rpc');
	}

	/**
	 * Cleans up resources when the app exits.
	 * Stops the server if it's running.
	 */
	public cleanup(): void {
		if (this.isRunning) {
			console.log('🧹 Cleaning up embedded server...');
			this.stopServer().catch(console.error);
		}
	}
}
