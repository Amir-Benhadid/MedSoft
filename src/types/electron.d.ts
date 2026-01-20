export { };

declare global {
    interface Window {
        electronAPI: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
            onDataChanged: (callback: (resource: string) => void) => () => void;

            // Other methods from preload
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

            // Setup helpers
            checkSetup: () => Promise<{ isSetup: boolean; config: any }>;
            saveSetup: (config: any) => Promise<boolean>;
            selectDirectory: () => Promise<string | null>;
            selectFile: (filters: any[]) => Promise<string | null>;
            copyLogo: (path: string) => Promise<string | null>;

            // Network / Discovery
            scanForServers: () => Promise<Array<{ ip: string; port: number; name: string }>>;
            getServerIP: () => Promise<string>;
        };
    }
}
