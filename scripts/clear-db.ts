
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

// Determine database path
// On Windows: %APPDATA%\cabinet\cabinet-medical.db
const appData = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config');
const dbPath = path.join(appData, 'cabinet', 'cabinet-medical.db');

console.log(`🔌 Connecting to database at: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file not found!');
    process.exit(1);
}

const db = new Database(dbPath);

const TABLES_TO_CLEAR = [
    'consultations',
    'eye_measurements',
    'clinical_exams',
    'appointments',
    'patients',
    'waitlist_entries',
    'dilations',
    'invoices',
    'messages',
    'todos',
    'stats'
];

const TABLES_TO_KEEP = [
    'medicines',
    'consultation_types',
    'lentille_conv',
    'settings',
    'migrations'
];

function clearDatabase() {
    try {
        console.log('🧹 Clearing transactional data...');

        // Disable Foreign Keys to allow clearing in any order
        db.pragma('foreign_keys = OFF');

        const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r: any) => r.name);

        db.transaction(() => {
            for (const table of TABLES_TO_CLEAR) {
                if (existingTables.includes(table)) {
                    console.log(`   - Clearing ${table}...`);
                    db.prepare(`DELETE FROM ${table}`).run();
                    // Reset autoincrement if it exists
                    try {
                        db.prepare(`DELETE FROM sqlite_sequence WHERE name = ?`).run(table);
                    } catch (e) {
                        // ignore if no autoincrement
                    }
                } else {
                    console.log(`   - Skipping ${table} (does not exist)`);
                }
            }
        })();

        // Re-enable Foreign Keys
        db.pragma('foreign_keys = ON');

        console.log('✅ Database cleared successfully!');
        console.log('   Preserved tables:', TABLES_TO_KEEP.join(', '));

    } catch (error) {
        console.error('❌ Failed to clear database:', error);
    } finally {
        db.close();
    }
}

// Confirmation
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('⚠️  Are you sure you want to clear all patient and consultation data? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        clearDatabase();
    } else {
        console.log('❌ Operation cancelled.');
    }
    rl.close();
});
