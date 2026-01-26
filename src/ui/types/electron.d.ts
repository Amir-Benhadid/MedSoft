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
