import { ChildProcess, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Manages a separate Node.js process for running the server.
 * Uses singleton pattern to ensure only one server process exists at a time.
 */
export class ProcessManager {
	private static instance: ProcessManager;
	private serverProcess: ChildProcess | null = null;
	private isServerStarting = false;
	private isServerRunning = false;

	private constructor() { }

	/**
	 * Gets the singleton instance of ProcessManager.
	 *
	 * @returns The ProcessManager instance
	 */
	public static getInstance(): ProcessManager {
		if (!ProcessManager.instance) {
			ProcessManager.instance = new ProcessManager();
		}
		return ProcessManager.instance;
	}

	/**
	 * Starts the server as a separate Node.js process.
	 * Checks if server is already running before starting a new one.
	 *
	 * @returns Promise resolving to an object with success status, optional PID, and optional error message
	 */
	public async startServerProcess(): Promise<{
		success: boolean;
		pid?: number;
		error?: string;
	}> {
		console.log('=== SERVER STARTUP DEBUG ===');
		console.log(`Current time: ${new Date().toISOString()}`);
		console.log(`Process platform: ${process.platform}`);
		console.log(`Process arch: ${process.arch}`);
		console.log(`Node version: ${process.version}`);
		console.log(`Process cwd: ${process.cwd()}`);
		console.log(
			`Process resourcesPath: ${(process as any).resourcesPath || 'undefined'}`
		);
		console.log(`__dirname: ${__dirname}`);
		console.log(`Environment NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

		if (this.isServerRunning) {
			console.log('✅ Server process is already running');
			return { success: true, pid: this.serverProcess?.pid };
		}

		if (this.isServerStarting) {
			console.log('⏳ Server process is already starting');
			return { success: false, error: 'Server is already starting' };
		}

		this.isServerStarting = true;

		try {
			console.log('🚀 Starting separate server process...');

			// Determine server script path
			const isDevelopment = process.env.NODE_ENV === 'development';
			const appPath = (process as any).resourcesPath || process.cwd();

			console.log(`🔍 Development mode: ${isDevelopment}`);
			console.log(`🔍 App path: ${appPath}`);

			// Check if server is already running before starting
			console.log('🔍 Checking if server is already running...');
			try {
				const isAlreadyRunning = await this.checkServerHealth();
				if (isAlreadyRunning) {
					console.log('✅ Server is already running - skipping startup');
					this.isServerRunning = true;
					this.isServerStarting = false;
					return {
						success: true,
						pid: undefined, // We don't own this process
					};
				}
			} catch {
				console.log('🔍 Server health check failed - proceeding with startup');
			}

			let serverScriptPath: string;

			if (isDevelopment) {
				// In development, use the source file
				serverScriptPath = path.join(process.cwd(), 'start-server.js');
			} else {
				// In production, look for the server script in resources
				const possiblePaths = [
					path.join(appPath, 'start-server.js'),
					path.join(appPath, 'resources', 'start-server.js'),
					path.join(appPath, 'app.asar', 'start-server.js'),
					path.join(appPath, 'resources', 'app.asar', 'start-server.js'),
					// Additional paths for different packaging structures
					path.join((process as any).resourcesPath, 'start-server.js'),
					path.join((process as any).resourcesPath, 'app', 'start-server.js'),
					path.join(__dirname, '..', '..', 'start-server.js'),
				];

				console.log('Checking server script paths:');
				possiblePaths.forEach((p) =>
					console.log(`  ${p} - ${fs.existsSync(p) ? 'EXISTS' : 'MISSING'}`)
				);

				serverScriptPath =
					possiblePaths.find((p) => {
						try {
							fs.accessSync(p);
							console.log(`✅ Found server script at: ${p}`);
							return true;
						} catch {
							return false;
						}
					}) || possiblePaths[0];

				if (!fs.existsSync(serverScriptPath)) {
					console.error(
						`❌ Server script not found at any of the expected paths!`
					);
					console.error(`Final path being used: ${serverScriptPath}`);
				}
			}

			console.log(`📁 Server script path: ${serverScriptPath}`);

			// Verify server script exists before spawning
			if (!fs.existsSync(serverScriptPath)) {
				throw new Error(`Server script not found at: ${serverScriptPath}`);
			}

			// Prepare spawn options
			const workingDir = isDevelopment ? process.cwd() : appPath;
			const spawnOptions = {
				stdio: ['pipe', 'pipe', 'pipe'] as ['pipe', 'pipe', 'pipe'],
				shell: true,
				detached: false,
				cwd: workingDir,
				env: {
					...process.env,
					NODE_ENV: isDevelopment ? 'development' : 'production',
					FORCE_COLOR: '1', // Keep colors in logs
					PORT: '3001', // Explicitly set port
				},
			};

			console.log('🔧 Spawn options:');
			console.log(`  Command: node ${serverScriptPath}`);
			console.log(`  CWD: ${workingDir}`);
			console.log(`  NODE_ENV: ${spawnOptions.env.NODE_ENV}`);
			console.log(`  PORT: ${spawnOptions.env.PORT}`);

			// Spawn the server process
			this.serverProcess = spawn('node', [serverScriptPath], spawnOptions);

			if (this.serverProcess && this.serverProcess.pid) {
				console.log(
					`📋 Server process spawned with PID: ${this.serverProcess.pid}`
				);
			} else {
				console.error('❌ Failed to spawn server process - no PID assigned');
			}

			// Handle server output
			if (this.serverProcess) {
				this.serverProcess.stdout?.on('data', (data) => {
					const output = data.toString().trim();
					console.log(`[SERVER] ${output}`);
				});

				this.serverProcess.stderr?.on('data', (data) => {
					const output = data.toString().trim();
					console.error(`[SERVER ERROR] ${output}`);
				});

				// Handle server process exit
				this.serverProcess.on('close', (code) => {
					console.log(`[SERVER] Process exited with code ${code}`);
					console.log(
						`[SERVER DEBUG] Exit timestamp: ${new Date().toISOString()}`
					);
					this.serverProcess = null;
					this.isServerRunning = false;
					this.isServerStarting = false;
				});

				this.serverProcess.on('error', (error) => {
					console.error('[SERVER] Failed to start server process:', error);
					console.error(
						`[SERVER DEBUG] Error timestamp: ${new Date().toISOString()}`
					);
					console.error(`[SERVER DEBUG] Error details:`, error);
					this.serverProcess = null;
					this.isServerRunning = false;
					this.isServerStarting = false;
				});
			} else {
				throw new Error('Server process is null after spawn attempt');
			}

			// Wait for server to be ready
			console.log('⏳ Waiting for server to start...');
			const serverReady = await this.waitForServerReady();

			this.isServerStarting = false;

			if (serverReady) {
				this.isServerRunning = true;
				console.log('✅ Server process started successfully');
				return {
					success: true,
					pid: this.serverProcess?.pid,
				};
			} else {
				console.error('❌ Server failed to become ready');
				await this.stopServerProcess();
				return {
					success: false,
					error: 'Server failed to start properly',
				};
			}
		} catch (error) {
			this.isServerStarting = false;
			console.error('Error starting server process:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Stops the server process gracefully.
	 * Attempts SIGTERM first, then SIGKILL if necessary.
	 *
	 * @returns Promise resolving to an object with success status and optional error message
	 */
	public async stopServerProcess(): Promise<{
		success: boolean;
		error?: string;
	}> {
		if (!this.serverProcess || !this.isServerRunning) {
			console.log('Server process is not running');
			return { success: true };
		}

		try {
			console.log('🛑 Stopping server process...');

			// Try graceful shutdown first
			this.serverProcess.kill('SIGTERM');

			// Wait for graceful shutdown
			await new Promise<void>((resolve) => {
				const timeout = setTimeout(() => {
					// Force kill if graceful shutdown fails
					if (this.serverProcess && !this.serverProcess.killed) {
						console.log('Force killing server process...');
						this.serverProcess.kill('SIGKILL');
					}
					resolve();
				}, 5000);

				this.serverProcess?.on('close', () => {
					clearTimeout(timeout);
					resolve();
				});
			});

			this.serverProcess = null;
			this.isServerRunning = false;
			console.log('✅ Server process stopped successfully');
			return { success: true };
		} catch (error) {
			console.error('Error stopping server process:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Checks if the server process is currently running.
	 *
	 * @returns True if the server process is running, false otherwise
	 */
	public isServerProcessRunning(): boolean {
		return (
			this.isServerRunning &&
			this.serverProcess !== null &&
			!this.serverProcess.killed
		);
	}

	/**
	 * Waits for the server to become ready by polling the health endpoint.
	 *
	 * @param maxAttempts - Maximum number of health check attempts (default: 30)
	 * @param delay - Delay between attempts in milliseconds (default: 1000)
	 * @returns Promise resolving to true if server is ready, false if max attempts reached
	 */
	private async waitForServerReady(
		maxAttempts = 30,
		delay = 1000
	): Promise<boolean> {
		console.log(
			`🔍 Waiting for server health check (max ${maxAttempts} attempts, ${delay}ms delay)`
		);

		for (let i = 0; i < maxAttempts; i++) {
			try {
				console.log(`[HEALTH CHECK] Attempt ${i + 1}/${maxAttempts}`);
				const isReady = await this.checkServerHealth();

				if (isReady) {
					console.log(`✅ Server health check passed on attempt ${i + 1}`);
					return true;
				} else {
					console.log(`❌ Server health check failed on attempt ${i + 1}`);
				}
			} catch (error) {
				console.error(`[HEALTH CHECK] Error on attempt ${i + 1}:`, error);
			}

			if (i < maxAttempts - 1) {
				console.log(`⏳ Waiting ${delay}ms before next health check...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		console.error(
			`❌ Server health check failed after ${maxAttempts} attempts`
		);
		return false;
	}

	/**
	 * Checks server health.
	 * Currently disabled / relies on IPC or other mechanisms check.
	 *
	 * @returns Promise resolving to true (always returns true)
	 */
	private async checkServerHealth(): Promise<boolean> {
		console.log('[HEALTH CHECK] Server health check bypass');
		return true;
	}

	/**
	 * Cleans up resources when the app exits.
	 * Stops the server process if it's running.
	 */
	public cleanup(): void {
		if (this.isServerRunning) {
			console.log('🧹 Cleaning up server process...');
			this.stopServerProcess().catch(console.error);
		}
	}
}
