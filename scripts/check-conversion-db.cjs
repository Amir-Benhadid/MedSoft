
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = 'C:\\Users\\amirb\\OneDrive\\Documents\\test\\cabinet-medical.db';
console.log(`Targeting DB: ${dbPath}`);

function run() {
    try {
        if (!fs.existsSync(dbPath)) {
            console.error('DB file does not exist at target path.');
            return;
        }

        console.log(`Opening database...`);
        const db = new Database(dbPath);

        // Check if table exists
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lentille_conv'").get();
        if (!tableCheck) {
            console.log('Table lentille_conv MISSING. Creating and Seeding...');
            db.exec(`
                CREATE TABLE IF NOT EXISTS lentille_conv (
                    id TEXT PRIMARY KEY,
                    num_enr TEXT,
                    idtab_conversion TEXT,
                    lunettes REAL,
                    lun_plus TEXT,
                    lun_moins TEXT
                );
            `);
            seed(db);
        } else {
            const count = db.prepare('SELECT count(*) as count FROM lentille_conv').get().count;
            console.log(`Table lentille_conv exists with ${count} rows.`);

            if (count === 0) {
                console.log('Table empty. Seeding...');
                seed(db);
            } else {
                // Debug values
                const testVal = 5.0;
                const row = db.prepare('SELECT * FROM lentille_conv WHERE lunettes = ?').get(testVal);
                console.log(`Row for ${testVal}:`, row);

                if (!row) {
                    console.log('Row 5.00 missing. Attempting partial re-seed check...');
                }
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

function seed(db) {
    const seedFile = path.join(process.cwd(), 'public', 'seed', 'conversion.sql');
    if (!fs.existsSync(seedFile)) {
        console.error('Seed file missing:', seedFile);
        return;
    }

    let sql = fs.readFileSync(seedFile, 'utf-8');
    sql = sql.replace(/"public"\./g, '');

    try {
        db.exec(sql);
        const newCount = db.prepare('SELECT count(*) as count FROM lentille_conv').get().count;
        console.log(`Seeding successful. New count: ${newCount}`);
    } catch (e) {
        console.error('Seeding failed:', e);
    }
}

run();
