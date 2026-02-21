import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { setupORPCServer } from './orpc/server.js';
import { closeDatabase } from './db/database.js';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

console.log('---------------------------------------------------');
console.log('[DEBUG] Starting Electron Main Process');
console.log('[DEBUG] Node Version:', process.version);
console.log('[DEBUG] Electron Version:', process.versions.electron);
console.log('[DEBUG] Chrome Version:', process.versions.chrome);
console.log('[DEBUG] Modules Version (ABI):', process.versions.modules);
console.log('[DEBUG] Platform:', process.platform);
console.log('[DEBUG] Arch:', process.arch);
console.log('---------------------------------------------------');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV === 'development';

let loaderWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;

// Register privileged schemes
protocol.registerSchemesAsPrivileged([
	{
		scheme: 'books',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			bypassCSP: true,
			corsEnabled: true,
			stream: true,
		},
	},
	{
		scheme: 'local-resource',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			bypassCSP: true,
			corsEnabled: true,
			stream: true,
		},
	},
]);

// Handle single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	console.log('🚫 Another instance is already running. Quitting...');
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		console.log('🔄 Second instance detected. Focusing existing window...');
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		} else if (loaderWindow) {
			if (loaderWindow.isMinimized()) loaderWindow.restore();
			loaderWindow.focus();
		}
	});
}

const DEFAULT_WIDTH = 550;
const DEFAULT_HEIGHT = 550;
const LOADER_WIDTH = 600;
const LOADER_HEIGHT = 300;

/**
 * Creates a loader window that displays during app initialization or setup.
 * The loader window is frameless, transparent, and non-resizable.
 *
 * @param width - Width of the loader window in pixels
 * @param height - Height of the loader window in pixels
 */
function createLoaderWindow(width: number, height: number) {
	const preloadPath = path.join(__dirname, 'preload.js');

	console.log('🚀 Creating Cabinet Medical Loader window...');
	console.log(`📁 Preload: ${preloadPath}`);
	console.log(`🔧 Development: ${isDevelopment}`);

	loaderWindow = new BrowserWindow({
		width: width,
		height: height,
		minWidth: width,
		minHeight: height,
		resizable: false,
		backgroundColor: '#00000000',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			webSecurity: true,
			preload: preloadPath,
			allowRunningInsecureContent: false,
			experimentalFeatures: false,
		},
		titleBarStyle: 'hidden',
		show: false,
		frame: false,
		transparent: true,
		center: true,
		hasShadow: true,
	});

	if (isDevelopment) {
		const port = process.env.PORT || 3001;
		loaderWindow.loadURL(`http://127.0.0.1:${port}?window=loader`);
	} else {
		const htmlPath = path.join(__dirname, '../dist-react/index.html');
		console.log(`📄 Loading HTML from: ${htmlPath}`);
		loaderWindow.loadURL(`file://${htmlPath}?window=loader`);
	}

	loaderWindow.once('ready-to-show', () => {
		console.log('✅ Loader window is ready to show');
		setTimeout(() => {
			loaderWindow?.show();
			console.log('✅ Loader window shown');
		}, 250);
	});

	loaderWindow.webContents.on('will-navigate', (event, url) => {
		if (
			!url.startsWith('http://127.0.0.1:5173') &&
			!url.startsWith('http://localhost') &&
			!url.startsWith('file://')
		) {
			event.preventDefault();
			console.log('🚫 Blocked navigation to:', url);
		}
	});

	loaderWindow.on('closed', () => {
		loaderWindow = null;
	});
}

/**
 * Creates the main application window.
 * The main window is resizable, frameless, and maximizes on first show.
 */
function createMainWindow() {
	const preloadPath = path.join(__dirname, 'preload.js');

	console.log('🚀 Creating Cabinet Medical Main window...');

	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 1000,
		minHeight: 700,
		resizable: true,
		backgroundColor: '#ffffff',
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			webSecurity: true,
			preload: preloadPath,
			allowRunningInsecureContent: false,
			experimentalFeatures: false,
		},
		titleBarStyle: 'hidden',
		frame: false,
		show: false,
		center: true,
		hasShadow: true,
	});

	if (isDevelopment) {
		const port = process.env.PORT || 3001;
		mainWindow.loadURL(`http://127.0.0.1:${port}?window=main`);
		mainWindow.webContents.openDevTools();
	} else {
		const htmlPath = path.join(__dirname, '../dist-react/index.html');
		mainWindow.loadURL(`file://${htmlPath}?window=main`);
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow?.maximize();
		mainWindow?.show();
		console.log('✅ Main window is ready');
	});
}

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
console.log('📂 User Data Path:', app.getPath('userData'));
console.log('📄 Config Path:', CONFIG_PATH);

let cachedConfig: any = null;

/**
 * Loads the application configuration from disk.
 *
 * @param force - If true, bypasses cache and reloads from disk
 * @returns The configuration object, or null if not found or error occurred
 */
async function loadConfig(force: boolean = false) {
	if (cachedConfig && !force) {
		return cachedConfig;
	}

	try {
		console.log('📖 Attempting to read config from:', CONFIG_PATH);
		const data = await fs.readFile(CONFIG_PATH, 'utf-8');
		const config = JSON.parse(data);
		console.log('✅ Config loaded:', config);
		cachedConfig = config;
		return config;
	} catch (error) {
		console.log('⚠️ No config found (or error reading):', error);
		return null;
	}
}

/**
 * Saves the application configuration to disk.
 *
 * @param config - The configuration object to save
 */
async function saveConfig(config: any) {
	cachedConfig = config;
	await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

/**
 * Sets up all IPC (Inter-Process Communication) handlers for communication
 * between the main process and renderer processes.
 * Handles app configuration, window management, file operations, and network discovery.
 */
function setupIPC() {
	ipcMain.handle('app:getVersion', () => app.getVersion());
	ipcMain.handle('app:getName', () => app.getName());

	ipcMain.handle('app:checkSetup', async () => {
		const config = await loadConfig();
		return {
			isSetup: !!config && (config.serverMode === 'client' || !!config.dbPath),
			config: config || {},
		};
	});

	ipcMain.handle('app:saveSetup', async (event, config: any) => {
		console.log('💾 Saving setup config:', config);

		if (config.logoPath) {
			try {
				const basePath = (config.serverMode === 'host' && config.dbPath)
					? config.dbPath
					: app.getPath('userData');

				const assetsDir = path.join(basePath, 'assets');
				await fs.mkdir(assetsDir, { recursive: true });

				const ext = path.extname(config.logoPath);
				const fileName = `logo${ext}`;
				const destPath = path.join(assetsDir, fileName);

				if (path.resolve(config.logoPath) !== path.resolve(destPath)) {
					console.log(`🖼️ Copying logo during setup from ${config.logoPath} to ${destPath}`);
					await fs.copyFile(config.logoPath, destPath);
					config.logoPath = destPath;
				}
			} catch (e) {
				console.error("❌ Failed to copy logo during setup:", e);
			}
		}

		const syncParams = {
			enabled: config.enableSupabaseSync,
			url: config.supabaseUrl,
			key: config.supabaseKey
		};

		delete config.enableSupabaseSync;
		delete config.supabaseUrl;
		delete config.supabaseKey;

		await saveConfig(config);

		try {
			const { closeDatabase, getDatabase } = await import('./db/database.js');
			closeDatabase();

			if (config.serverMode !== 'client') {
				getDatabase();
			}
		} catch (e) {
			console.error("Failed to re-init database:", e);
		}

		if (syncParams.enabled && syncParams.url && syncParams.key) {
			try {
				const { syncFromSupabase } = await import('./services/supabaseSync.js');
				console.log('🔄 Triggering Supabase Sync...');
				const result = await syncFromSupabase(syncParams.url, syncParams.key);
				console.log('✅ Sync Result:', result);
			} catch (error) {
				console.error("❌ Supabase Sync Failed:", error);
			}
		}

		return true;
	});

	ipcMain.handle('app:launchMainWindow', () => {
		console.log('🚀 Launching main window...');
		createMainWindow();
		if (loaderWindow) {
			loaderWindow.close();
			loaderWindow = null;
		}
	});

	ipcMain.handle('dialog:selectDirectory', async (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		const result = await import('electron').then(({ dialog }) =>
			dialog.showOpenDialog(win!, {
				properties: ['openDirectory', 'createDirectory'],
			})
		);

		if (result.canceled || result.filePaths.length === 0) {
			return null;
		}
		return result.filePaths[0];
	});

	ipcMain.handle('dialog:selectFile', async (event, filters = []) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		const result = await import('electron').then(({ dialog }) =>
			dialog.showOpenDialog(win!, {
				properties: ['openFile'],
				filters: filters,
			})
		);

		if (result.canceled || result.filePaths.length === 0) {
			return null;
		}
		return result.filePaths[0];
	});

	ipcMain.handle('dev:openDevTools', (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win && isDevelopment) {
			win.webContents.openDevTools();
		}
	});

	ipcMain.handle('dev:reload', (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win && isDevelopment) {
			win.reload();
		}
	});

	ipcMain.handle('window:maximize', (event) => {
		const win = BrowserWindow.fromWebContents(event.sender);
		if (win) {
			win.setResizable(true);
			if (!win.isMaximized()) {
				win.maximize();
			}
		}
	});

	ipcMain.handle('window:close', () => {
		app.quit();
	});

	ipcMain.handle('csv:readFile', async (event, filename: string) => {
		try {
			const appPath = app.getAppPath();
			const filePath = path.join(appPath, filename);
			console.log('📄 Reading CSV file:', filePath);

			const content = await fs.readFile(filePath, 'utf-8');
			console.log('✅ CSV file read successfully');
			return content;
		} catch (error) {
			console.error('❌ Error reading CSV file:', error);
			try {
				const fallbackPath = path.join(process.cwd(), filename);
				console.log('📄 Trying fallback path:', fallbackPath);
				const content = await fs.readFile(fallbackPath, 'utf-8');
				console.log('✅ CSV file read from fallback location');
				return content;
			} catch (fallbackError) {
				console.error(
					'❌ Error reading CSV file from fallback:',
					fallbackError
				);
				throw fallbackError;
			}
		}
	});

	ipcMain.handle(
		'csv:writeFile',
		async (event, filename: string, content: string) => {
			try {
				const appPath = app.getAppPath();
				const filePath = path.join(appPath, filename);
				console.log('💾 Writing CSV file:', filePath);

				await fs.mkdir(path.dirname(filePath), { recursive: true });
				await fs.writeFile(filePath, content, 'utf-8');
				console.log('✅ CSV file written successfully');
				return true;
			} catch (error) {
				console.error('❌ Error writing CSV file:', error);
				try {
					const fallbackPath = path.join(process.cwd(), filename);
					console.log('💾 Trying fallback path:', fallbackPath);
					await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
					await fs.writeFile(fallbackPath, content, 'utf-8');
					console.log('✅ CSV file written to fallback location');
					return true;
				} catch (fallbackError) {
					console.error(
						'❌ Error writing CSV file to fallback:',
						fallbackError
					);
					throw fallbackError;
				}
			}
		}
	);

	ipcMain.handle('app:copyLogo', async (event, sourcePath: string) => {
		try {
			if (!sourcePath) return null;

			const config = await loadConfig();
			const basePath = (config && config.dbPath) ? config.dbPath : app.getPath('userData');

			const assetsDir = path.join(basePath, 'assets');
			await fs.mkdir(assetsDir, { recursive: true });

			const ext = path.extname(sourcePath);
			const fileName = `logo${ext}`;
			const destPath = path.join(assetsDir, fileName);

			console.log(`🖼️ Copying logo from ${sourcePath} to ${destPath}`);
			await fs.copyFile(sourcePath, destPath);

			return destPath;
		} catch (error) {
			console.error('❌ Failed to copy logo:', error);
			return null;
		}
	});

	let sharedScanner: any = null;
	let scanPromise: Promise<any> | null = null;

	ipcMain.handle('network:scan', async () => {
		if (scanPromise) {
			console.log('🔍 Scan already in progress, returning existing promise...');
			return scanPromise;
		}

		const { ServiceScanner } = await import('./utils/discovery.js');
		if (!sharedScanner) {
			sharedScanner = new ServiceScanner();
		}

		console.log('🔍 Scanning for servers...');

		scanPromise = new Promise((resolve) => {
			sharedScanner.start();

			setTimeout(() => {
				const results = sharedScanner.getServices();
				sharedScanner.stop();
				console.log(`🔍 Scan complete. Found ${results.length} servers.`);
				scanPromise = null;
				resolve(results);
			}, 5000);
		});

		return scanPromise;
	});

	ipcMain.handle('app:factoryReset', async () => {
		console.log('⚠️ FACTORY RESET TRIGGERED ⚠️');

		try {
			const config = await loadConfig();

			// 1. Close Database
			try {
				const { closeDatabase } = await import('./db/database.js');
				closeDatabase();
			} catch (e) {
				console.error("Failed to close database:", e);
			}

			// 2. Delete Database File(s)
			if (config && config.dbPath) {
				try {
					console.log('🗑️ Deleting database at:', config.dbPath);
					await fs.rm(config.dbPath, { recursive: true, force: true });
				} catch (e) {
					console.error("Failed to delete database:", e);
				}
			}

			// 3. Delete Config
			try {
				console.log('🗑️ Deleting config file:', CONFIG_PATH);
				await fs.unlink(CONFIG_PATH);
			} catch (e) {
				console.error("Failed to delete config:", e);
			}

			// 4. Relaunch
			console.log('🔄 Relaunching application...');
			app.relaunch();
			app.exit(0);

			return true;
		} catch (error) {
			console.error("❌ Factory reset failed:", error);
			throw error;
		}
	});

	ipcMain.handle('app:seedMedicines', async () => {
		const { seedMedicinesFromSupabase } = await import('./services/supabaseSync.js');
		return seedMedicinesFromSupabase();
	});

	ipcMain.handle('app:seedLentilleConversion', async () => {
		const { getDatabase, seedLentilleConversion } = await import('./db/database.js');
		const db = getDatabase();
		return seedLentilleConversion(db);
	});

	ipcMain.handle('network:getServerIP', async () => {
		const { getLocalIP } = await import('./utils/discovery.js');
		return getLocalIP();
	});

	loadConfig().then(async (config) => {
		if (config && config.serverMode !== 'client') {
			const { ElectronServerManager } = await import('./serverManager.js');
			const manager = ElectronServerManager.getInstance();
			const businessName = config.businessName || 'Cabinet Medical';

			console.log('🖥️ Starting Host Application Server...');
			await manager.startServer(businessName);
		}
	});
}

/**
 * Sets up the auto-updater to check for updates and notify the user.
 */
function setupAutoUpdater() {
	console.log('🔄 Setting up Auto Updater...');
	autoUpdater.logger = console;

	// Check for updates and notify
	// This will download the update in the background and notify when ready
	autoUpdater.checkForUpdatesAndNotify();

	// IPC handlers for manual update checks if needed
	ipcMain.handle('app:checkForUpdates', () => {
		console.log('🔄 Manually checking for updates...');
		return autoUpdater.checkForUpdates();
	});

	ipcMain.handle('app:quitAndInstall', () => {
		console.log('🔄 Quitting and installing update...');
		autoUpdater.quitAndInstall();
	});

	autoUpdater.on('checking-for-update', () => {
		console.log('Checking for update...');
	});

	autoUpdater.on('update-available', (info) => {
		console.log('Update available.', info);
		mainWindow?.webContents.send('update-available', info);
	});

	autoUpdater.on('update-not-available', (info) => {
		console.log('Update not available.', info);
		mainWindow?.webContents.send('update-not-available', info);
	});

	autoUpdater.on('error', (err) => {
		console.log('Error in auto-updater. ' + err);
		mainWindow?.webContents.send('update-error', err);
	});

	autoUpdater.on('download-progress', (progressObj) => {
		let log_message = "Download speed: " + progressObj.bytesPerSecond;
		log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
		log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
		console.log(log_message);
		mainWindow?.webContents.send('download-progress', progressObj);
	});

	autoUpdater.on('update-downloaded', (info) => {
		console.log('Update downloaded', info);
		mainWindow?.webContents.send('update-downloaded', info);
	});


}

app.whenReady().then(async () => {
	console.log('=== CABINET MEDICAL ELECTRON APP ===');
	console.log(`📱 App: ${app.getName()} v${app.getVersion()}`);
	console.log(`⚡ Electron: ${process.versions.electron}`);
	console.log(`🌐 Chrome: ${process.versions.chrome}`);
	console.log(`📦 Node: ${process.versions.node}`);
	console.log(`💻 Platform: ${process.platform}`);
	console.log(`🏗️ Architecture: ${process.arch}`);
	console.log(`📂 App Path: ${app.getAppPath()}`);
	console.log(`🔧 Development: ${isDevelopment}`);

	try {
		const cachePath = path.join(app.getPath('userData'), 'Cache');
		fs.mkdir(cachePath, { recursive: true }).catch(() => {
		});
		console.log(`📦 Cache directory: ${cachePath}`);
	} catch (error) {
		console.warn('⚠️ Cache configuration (harmless warning)');
	}

	console.log('=====================================');

	setupIPC();
	setupAutoUpdater();
	setupORPCServer();

	const { net } = await import('electron');

	/**
	 * Determines the MIME type based on file extension.
	 *
	 * @param filePath - The file path to analyze
	 * @returns The MIME type string
	 */
	const getMimeType = (filePath: string) => {
		const ext = path.extname(filePath).toLowerCase();
		switch (ext) {
			case '.pdf': return 'application/pdf';
			case '.png': return 'image/png';
			case '.jpg':
			case '.jpeg': return 'image/jpeg';
			case '.gif': return 'image/gif';
			case '.svg': return 'image/svg+xml';
			case '.html': return 'text/html';
			case '.css': return 'text/css';
			case '.js': return 'text/javascript';
			case '.json': return 'application/json';
			default: return 'application/octet-stream';
		}
	};

	/**
	 * Handles requests to the 'books://' custom protocol.
	 * Serves PDF files from the books directory, supporting both absolute and relative paths.
	 */
	protocol.handle('books', async (request) => {
		try {
			let urlStr = request.url.replace(/^books:\/\//, '');

			const queryIndex = urlStr.indexOf('?');
			if (queryIndex !== -1) {
				urlStr = urlStr.substring(0, queryIndex);
			}

			while (urlStr.endsWith('/')) {
				urlStr = urlStr.slice(0, -1);
			}

			const decodedPath = decodeURIComponent(urlStr);

			const config = await loadConfig();
			const basePath = (config && config.dbPath) ? config.dbPath : app.getPath('userData');
			const booksDir = path.join(basePath, 'books');

			let filePath;

			let potentialAbsolutePath = decodedPath;
			if (process.platform === 'win32') {
				if (potentialAbsolutePath.startsWith('/')) {
					potentialAbsolutePath = potentialAbsolutePath.slice(1);
				}
				if (/^[a-zA-Z]\//.test(potentialAbsolutePath)) {
					potentialAbsolutePath = `${potentialAbsolutePath[0]}:/${potentialAbsolutePath.slice(2)}`;
				}
			}

			if (path.isAbsolute(potentialAbsolutePath)) {
				try {
					await fs.access(potentialAbsolutePath);
					filePath = potentialAbsolutePath;
					console.log(`   -> Detected absolute path (Windows fixed): ${filePath}`);
				} catch {
					filePath = path.join(booksDir, decodedPath);
					console.log(`   -> Absolute check failed, treating as relative: ${filePath}`);
				}
			} else {
				filePath = path.join(booksDir, decodedPath);
			}

			console.log(`📚 Serving book: ${filePath}`);

			const buffer = await fs.readFile(filePath);
			return new Response(buffer, {
				headers: {
					'Content-Type': 'application/pdf',
					'Access-Control-Allow-Origin': '*'
				}
			});
		} catch (error) {
			console.error('❌ Error serving book:', error);
			return new Response('Not Found', { status: 404 });
		}
	});
	/**
	 * Handles requests to the 'local-resource://' custom protocol.
	 * Serves local files with proper MIME types, handling Windows path quirks.
	 */
	protocol.handle('local-resource', async (request) => {
		const url = request.url;
		const rawPath = url.replace(/^local-resource:\/\//, '');
		const decodedPath = decodeURIComponent(rawPath);

		console.log(`🖼️ Local Resource Request: ${url}`);

		try {
			let cleanPath = decodedPath;

			if (process.platform === 'win32') {
				if (cleanPath.startsWith('/')) {
					cleanPath = cleanPath.slice(1);
				}

				if (/^[a-zA-Z]\//.test(cleanPath)) {
					console.log(`   🔧 Fixing malformed Windows path: ${cleanPath} -> ${cleanPath[0]}:/${cleanPath.slice(2)}`);
					cleanPath = `${cleanPath[0]}:/${cleanPath.slice(2)}`;
				}
			}

			let finalPath;
			if (path.isAbsolute(cleanPath)) {
				finalPath = cleanPath;
			} else {
				const userDataPath = app.getPath('userData');
				finalPath = path.join(userDataPath, cleanPath);
				console.log(`   -> Relative path detected, trying in userData: ${finalPath}`);
			}

			console.log(`   -> Reading file: ${finalPath}`);

			const buffer = await fs.readFile(finalPath);
			const mimeType = getMimeType(finalPath);

			return new Response(buffer, {
				headers: {
					'Content-Type': mimeType,
					'Access-Control-Allow-Origin': '*'
				}
			});

		} catch (error) {
			console.error(`❌ Error handling local-resource request for ${url}:`, error);
			return new Response('Not Found', { status: 404 });
		}
	});

	const config = await loadConfig();
	const isSetup = !!config && (config.serverMode === 'client' || !!config.dbPath);

	console.log('isSetup', isSetup);

	if (isDevelopment && isSetup) {
		console.log('🔧 Development mode detected and app is setup. Skipping loader.');
		createMainWindow();
		return;
	}

	const width = isSetup ? LOADER_WIDTH : DEFAULT_WIDTH;
	const height = isSetup ? LOADER_HEIGHT : DEFAULT_HEIGHT;

	createLoaderWindow(width, height);
});

app.on('before-quit', () => {
	console.log('🛑 App is quitting...');
	closeDatabase();
});

app.on('window-all-closed', () => {
	console.log('🚪 All windows closed');
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', async () => {
	console.log('📱 App activated');
	if (loaderWindow === null && mainWindow === null) {
		const config = await loadConfig();
		const isSetup = !!config && (config.serverMode === 'client' || !!config.dbPath);

		if (isDevelopment && isSetup) {
			createMainWindow();
			return;
		}

		const width = isSetup ? LOADER_WIDTH : DEFAULT_WIDTH;
		const height = isSetup ? LOADER_HEIGHT : DEFAULT_HEIGHT;
		createLoaderWindow(width, height);
	}
});
app.on(
	'certificate-error',
	(
		event: any,
		webContents: any,
		url: string,
		error: string,
		certificate: any,
		callback: (isTrusted: boolean) => void
	) => {
		if (isDevelopment && url.startsWith('http://localhost')) {
			event.preventDefault();
			callback(true);
		} else {
			callback(false);
		}
	}
);

/**
 * Handles new window creation requests, allowing only safe internal windows
 * (PDF blobs, localhost, book viewer) and blocking external URLs for security.
 */
app.on('web-contents-created', (event: any, contents: any) => {
	contents.setWindowOpenHandler(({ url }: { url: string }) => {
		console.log('🪟 New window requested for:', url);
		console.log('🔍 URL analysis:');
		console.log('  - Starts with blob:', url.startsWith('blob:'));
		console.log(
			'  - Starts with http://localhost:',
			url.startsWith('http://localhost')
		);
		console.log(
			'  - Starts with https://localhost:',
			url.startsWith('https://localhost')
		);

		if (url.startsWith('blob:')) {
			console.log('✅ Allowing PDF blob popup');
			return {
				action: 'allow',
				overrideBrowserWindowOptions: {
					width: 1000,
					height: 800,
					webPreferences: {
						nodeIntegration: false,
						contextIsolation: true,
						webSecurity: true,
					},
				},
			};
		}

		if (
			url.startsWith('http://localhost') ||
			url.startsWith('https://localhost')
		) {
			console.log('✅ Allowing localhost popup');
			return {
				action: 'allow',
				overrideBrowserWindowOptions: {
					width: 1000,
					height: 800,
					webPreferences: {
						nodeIntegration: false,
						contextIsolation: true,
						webSecurity: true,
					},
				},
			};
		}

		if (url.includes('/book-viewer')) {
			console.log('✅ Allowing internal book viewer popup');
			return {
				action: 'allow',
				overrideBrowserWindowOptions: {
					width: 1200,
					height: 900,
					autoHideMenuBar: true,
					webPreferences: {
						nodeIntegration: false,
						contextIsolation: true,
						webSecurity: true,
						preload: path.join(__dirname, 'preload.js'),
					},
				},
			};
		}

		console.log('🚫 Blocked new window for security:', url);
		return { action: 'deny' };
	});
});

console.log('🔧 Electron main process initialized');
