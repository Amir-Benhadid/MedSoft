
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const appName = 'medsoft'; // from package.json
const dbName = 'cabinet-medical.db';

function getDbPath() {
    // Check commonly used paths
    const startPaths = [
        path.join(process.env.APPDATA || '', appName),
        path.join(process.env.APPDATA || '', 'MedSoft'),
        process.cwd(),
        path.join(process.cwd(), 'data'),
    ];

    for (const p of startPaths) {
        const fullPath = path.join(p, dbName);
        console.log(`Checking DB at: ${fullPath}`);
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }
    return null;
}

function run() {
    const dbPath = getDbPath();
    if (!dbPath) {
        console.error('Could not find database file.');
        process.exit(1);
    }

    console.log(`Opening database: ${dbPath}`);
    const db = new Database(dbPath);

    // Check table existence
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lentille_conv'").get();
    if (!tableExists) {
        console.log('Table lentille_conv does not exist.');
        seed(db);
        return;
    }

    // Check count
    const count = db.prepare('SELECT count(*) as count FROM lentille_conv').get().count;
    console.log(`Table lentille_conv has ${count} rows.`);

    if (count === 0) {
        console.log('Table is empty. Seeding...');
        seed(db);
    } else {
        // Debug specific value
        const val = 5.00;
        console.log(`Checking for lunettes = ${val}...`);

        // Exact match
        const exact = db.prepare('SELECT * FROM lentille_conv WHERE lunettes = ?').get(val);
        console.log('Exact match:', exact);

        if (!exact) {
            // Debug range
            const rows = db.prepare('SELECT * FROM lentille_conv WHERE lunettes BETWEEN 4 AND 6').all();
            console.log('Rows between 4 and 6:', rows);
        }
    }
}

function seed(db) {
    const seedPath = path.join(process.cwd(), 'public', 'seed', 'conversion.sql');
    if (!fs.existsSync(seedPath)) {
        console.error(`Seed file not found at ${seedPath}`);
        return;
    }

    let sql = fs.readFileSync(seedPath, 'utf-8');
    sql = sql.replace(/"public"\./g, '');

    try {
        db.exec(sql);
        console.log('Seeding completed successfully.');

        // Verify
        const verifyCount = db.prepare('SELECT count(*) as count FROM lentille_conv').get().count;
        console.log(`New count: ${verifyCount}`);
    } catch (e) {
        console.error('Seeding failed:', e);
    }
}

run();
