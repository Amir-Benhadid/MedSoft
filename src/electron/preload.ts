/**
 * Preload script for Electron
 * 
 * This script runs in a context that has access to both the DOM and Node.js APIs,
 * but is isolated from the main world. It exposes a safe API to the renderer process
 * via contextBridge. Must use CommonJS format for Electron compatibility.
 */

const { contextBridge, ipcRenderer } = require('electron');

console.log('🔧 Cabinet Medical Preload Starting...');

try {
	/**
	 * Electron API object exposed to the renderer process.
	 * Provides safe IPC communication between renderer and main process.
	 */
	const electronAPI = {
		/**
		 * Test function to verify the API is working.
		 * @returns A success message string
		 */
		test: () => {
			console.log('✅ ElectronAPI test successful');
			return 'Cabinet Medical API is working!';
		},

		/**
		 * Gets the application version.
		 * @returns Promise resolving to the version string
		 */
		getVersion: () => ipcRenderer.invoke('app:getVersion'),

		/**
		 * Gets the application name.
		 * @returns Promise resolving to the app name string
		 */
		getName: () => ipcRenderer.invoke('app:getName'),

		/**
		 * Checks if running in Electron environment.
		 * @returns Always returns true
		 */
		isElectron: () => true,

		/**
		 * Current platform (win32, darwin, linux).
		 */
		platform: process.platform,

		/**
		 * Opens developer tools (development mode only).
		 * @returns Promise that resolves when dev tools are opened
		 */
		openDevTools: () => ipcRenderer.invoke('dev:openDevTools'),

		/**
		 * Reloads the current window (development mode only).
		 * @returns Promise that resolves when reload is triggered
		 */
		reloadApp: () => ipcRenderer.invoke('dev:reload'),

		/**
		 * Maximizes the current window.
		 * @returns Promise that resolves when window is maximized
		 */
		maximizeWindow: () => ipcRenderer.invoke('window:maximize'),

		/**
		 * Closes the application.
		 * @returns Promise that resolves when close is triggered
		 */
		closeWindow: () => ipcRenderer.invoke('window:close'),

		/**
		 * Launches the main application window and closes the loader.
		 * @returns Promise that resolves when main window is created
		 */
		launchMainWindow: () => ipcRenderer.invoke('app:launchMainWindow'),

		/**
		 * Reads a CSV file from the application directory.
		 * @param filename - The name of the CSV file to read
		 * @returns Promise resolving to the file content as a string
		 */
		readCsvFile: (filename: string) =>
			ipcRenderer.invoke('csv:readFile', filename),

		/**
		 * Writes content to a CSV file in the application directory.
		 * @param filename - The name of the CSV file to write
		 * @param content - The content to write to the file
		 * @returns Promise resolving to true on success
		 */
		writeCsvFile: (filename: string, content: string) =>
			ipcRenderer.invoke('csv:writeFile', filename, content),

		/**
		 * Generic IPC invocation handler for oRPC procedures.
		 * @param channel - The IPC channel name
		 * @param args - Arguments to pass to the handler
		 * @returns Promise resolving to the handler result
		 */
		invoke: (channel: string, ...args: any[]) =>
			ipcRenderer.invoke(channel, ...args),

		/**
		 * Checks if the application has been set up.
		 * @returns Promise resolving to setup status and config object
		 */
		checkSetup: () => ipcRenderer.invoke('app:checkSetup'),

		/**
		 * Saves the application setup configuration.
		 * @param config - The configuration object to save
		 * @returns Promise resolving to true on success
		 */
		saveSetup: (config: any) => ipcRenderer.invoke('app:saveSetup', config),

		/**
		 * Opens a directory selection dialog.
		 * @returns Promise resolving to the selected directory path or null
		 */
		selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),

		/**
		 * Opens a file selection dialog.
		 * @param filters - File type filters for the dialog
		 * @returns Promise resolving to the selected file path or null
		 */
		selectFile: (filters: any[]) => ipcRenderer.invoke('dialog:selectFile', filters),

		/**
		 * Copies a logo file to the assets directory.
		 * @param path - Source path of the logo file
		 * @returns Promise resolving to the destination path or null
		 */
		copyLogo: (path: string) => ipcRenderer.invoke('app:copyLogo', path),

		/**
		 * Scans the local network for Cabinet Medical servers.
		 * @returns Promise resolving to an array of discovered services
		 */
		scanForServers: () => ipcRenderer.invoke('network:scan'),

		/**
		 * Gets the local IP address of this machine.
		 * @returns Promise resolving to the IP address string
		 */
		getServerIP: () => ipcRenderer.invoke('network:getServerIP'),

		/**
		 * Subscribes to data change events.
		 * @param callback - Function called when data changes, receives resource name
		 * @returns Unsubscribe function to remove the listener
		 */
		onDataChanged: (callback: (resource: string) => void) => {
			const subscription = (_event: any, resource: string) => callback(resource);
			ipcRenderer.on('data-changed', subscription);
			return () => {
				ipcRenderer.removeListener('data-changed', subscription);
			};
		},

		/**
		 * Subscribes to update available events.
		 */
		onUpdateAvailable: (callback: (info: any) => void) => {
			const subscription = (_event: any, info: any) => callback(info);
			ipcRenderer.on('update-available', subscription);
			return () => {
				ipcRenderer.removeListener('update-available', subscription);
			};
		},

		/**
		 * Subscribes to update downloaded events.
		 */
		onUpdateDownloaded: (callback: (info: any) => void) => {
			const subscription = (_event: any, info: any) => callback(info);
			ipcRenderer.on('update-downloaded', subscription);
			return () => {
				ipcRenderer.removeListener('update-downloaded', subscription);
			};
		},

		/**
		 * Subscribes to download progress events.
		 */
		onDownloadProgress: (callback: (progress: any) => void) => {
			const subscription = (_event: any, progress: any) => callback(progress);
			ipcRenderer.on('download-progress', subscription);
			return () => {
				ipcRenderer.removeListener('download-progress', subscription);
			};
		},

		/**
		 * Subscribes to update error events.
		 */
		onUpdateError: (callback: (error: any) => void) => {
			const subscription = (_event: any, error: any) => callback(error);
			ipcRenderer.on('update-error', subscription);
			return () => {
				ipcRenderer.removeListener('update-error', subscription);
			};
		},

		/**
		 * Quits the application and installs the downloaded update.
		 */
		quitAndInstall: () => ipcRenderer.invoke('app:quitAndInstall'),
	};

	console.log('🔧 Exposing electronAPI to main world...');

	contextBridge.exposeInMainWorld('electronAPI', electronAPI);

	console.log('✅ ElectronAPI exposed successfully');
	console.log('📋 Available methods:', Object.keys(electronAPI));
} catch (error) {
	console.error('❌ Preload error:', error);
}
