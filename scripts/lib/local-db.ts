import fs from 'fs';
import os from 'os';
import path from 'path';

interface AppConfig {
    serverMode?: string;
    dbPath?: string;
}

function getUserDataPath() {
    const appData = process.env.APPDATA
        || (process.platform === 'darwin'
            ? path.join(os.homedir(), 'Library', 'Application Support')
            : path.join(os.homedir(), '.config'));

    return path.join(appData, 'cabinet');
}

export function resolveLocalDbPath() {
    const userDataPath = getUserDataPath();
    const configPath = path.join(userDataPath, 'config.json');
    let dbBasePath = userDataPath;

    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as AppConfig;

            if (config.serverMode === 'client') {
                throw new Error('Local database is disabled in client mode.');
            }

            if (config.dbPath) {
                dbBasePath = config.dbPath;
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('client mode')) {
                throw error;
            }

            console.warn('Could not parse config.json, falling back to default DB path.', error);
        }
    }

    return path.join(dbBasePath, 'cabinet-medical.db');
}
