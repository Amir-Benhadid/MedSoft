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
	closeWindow: () => Promise<void>;
	readCsvFile: (filename: string) => Promise<string>;
	writeCsvFile: (filename: string, content: string) => Promise<boolean>;
	invoke: (channel: string, ...args: any[]) => Promise<any>;
	// Setup
	checkSetup: () => Promise<{ isSetup: boolean; config: any }>;
	saveSetup: (config: any) => Promise<boolean>;
	selectDirectory: () => Promise<string | null>;
	selectFile: (filters: any[]) => Promise<string | null>;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
	}
}



