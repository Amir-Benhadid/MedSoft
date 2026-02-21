/**
 * Type definitions for Electron Preload API
 */

export interface ElectronAPI {
	test: () => string;
	getVersion: () => Promise<string>;
	getName: () => Promise<string>;
	isElectron: () => boolean;
	platform: string;
	openDevTools: () => Promise<void>;
	reloadApp: () => Promise<void>;
	maximizeWindow: () => Promise<void>;
	closeWindow: () => Promise<void>;
	launchMainWindow: () => Promise<void>;
	readCsvFile: (filename: string) => Promise<string>;
	writeCsvFile: (filename: string, content: string) => Promise<boolean>;
	invoke: (channel: string, ...args: any[]) => Promise<any>;
	// Setup
	checkSetup: () => Promise<{ isSetup: boolean; config: any }>;
	saveSetup: (config: any) => Promise<boolean>;
	selectDirectory: () => Promise<string | null>;
	selectFile: (filters: any[]) => Promise<string | null>;
	copyLogo: (path: string) => Promise<string | null>;
	factoryReset: () => Promise<boolean>;
	seedMedicines: () => Promise<{ success: boolean; message: string; stats?: { fetched: number; inserted: number; skipped: number } }>;
	seedLentilleConversion: () => Promise<{ success: boolean; message: string }>;
	// Network
	scanForServers: () => Promise<any[]>;
	getServerIP: () => Promise<string>;
	// Events
	onDataChanged: (callback: (resource: string) => void) => () => void;
	// Auto Updater
	onUpdateAvailable: (callback: (info: any) => void) => () => void;
	onUpdateDownloaded: (callback: (info: any) => void) => () => void;
	onDownloadProgress: (callback: (progress: any) => void) => () => void;
	onUpdateError: (callback: (error: any) => void) => () => void;
	quitAndInstall: () => Promise<void>;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
	}
}



