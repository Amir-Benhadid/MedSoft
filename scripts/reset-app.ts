import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

// Determine AppData path
const APPDATA = process.env.APPDATA || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Application Support') : path.join(os.homedir(), '.config'));
const APP_DATA_PATH = path.join(APPDATA, 'cabinet');

console.log('\x1b[36m%s\x1b[0m', '🔄 Resetting Application State...');
console.log(`📂 Target Data Directory: ${APP_DATA_PATH}`);

// 1. Kill Electron Processes to unlock files
try {
    console.log('🔪 Killing running Electron processes...');
    if (process.platform === 'win32') {
        execSync('taskkill /IM electron.exe /F', { stdio: 'ignore' });
    } else {
        execSync('pkill electron', { stdio: 'ignore' });
    }
} catch (error) {
    // Process might not be running, which is fine
}

// 2. Delete Configuration and Database
if (fs.existsSync(APP_DATA_PATH)) {
    const filesToDelete = [
        'config.json',
        'cabinet-medical.db',
        'cabinet-medical.db-shm',
        'cabinet-medical.db-wal'
    ];

    filesToDelete.forEach(file => {
        const filePath = path.join(APP_DATA_PATH, file);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`✅ Deleted: ${file}`);
            } catch (err: any) {
                console.error(`❌ Failed to delete ${file}:`, err.message);
            }
        } else {
            console.log(`ℹ️  ${file} not found (already clean)`);
        }
    });
} else {
    console.log('ℹ️  App data directory does not exist, nothing to clear.');
}

console.log('\x1b[32m%s\x1b[0m', '✨ Reset Complete!');
console.log('🚀 You can now run: pnpm dev');
