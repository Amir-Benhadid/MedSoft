import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { resolveLocalDbPath } from './lib/local-db.js';

type SeedPatient = {
    id: string;
    name: string;
    surname: string;
    dob?: string | null;
    phone_number?: string | null;
    phoneNumber?: string | null;
    phone?: string | null;
    medical_history?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    address?: {
        street?: string | null;
        city?: string | null;
    } | null;
};

function toTitleCase(value: string | null | undefined) {
    return (value || '')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
}

const samplePath = path.join(process.cwd(), 'supabase_samples', 'patients.json');
const dbPath = resolveLocalDbPath();

if (!fs.existsSync(samplePath)) {
    throw new Error(`Sample file not found: ${samplePath}`);
}

if (!fs.existsSync(dbPath)) {
    throw new Error(`Local database not found: ${dbPath}`);
}

const raw = fs.readFileSync(samplePath, 'utf-8');
const patients = JSON.parse(raw) as SeedPatient[];
const db = new Database(dbPath);

const existingCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };

const insertPatient = db.prepare(`
    INSERT OR IGNORE INTO patients (
        id, name, surname, dob, phone_number, street, city, oph_ants, gen_ants, created_at, updated_at
    ) VALUES (
        @id, @name, @surname, @dob, @phone_number, @street, @city, @oph_ants, @gen_ants, @created_at, @updated_at
    )
`);

const insertMany = db.transaction((rows: SeedPatient[]) => {
    let inserted = 0;

    for (const patient of rows) {
        const result = insertPatient.run({
            id: patient.id,
            name: toTitleCase(patient.name),
            surname: toTitleCase(patient.surname),
            dob: patient.dob || null,
            phone_number: patient.phone_number || patient.phoneNumber || patient.phone || null,
            street: patient.address?.street || null,
            city: toTitleCase(patient.address?.city || null),
            oph_ants: null,
            gen_ants: patient.medical_history || null,
            created_at: patient.created_at || new Date().toISOString(),
            updated_at: patient.updated_at || patient.created_at || new Date().toISOString(),
        });

        inserted += result.changes;
    }

    return inserted;
});

try {
    console.log(`Using database: ${dbPath}`);
    console.log(`Local patients before import: ${existingCount.count}`);
    console.log(`Sample patients available: ${patients.length}`);

    const inserted = insertMany(patients);
    const finalCount = db.prepare('SELECT COUNT(*) as count FROM patients').get() as { count: number };

    console.log(`Inserted new patients: ${inserted}`);
    console.log(`Skipped existing patients: ${patients.length - inserted}`);
    console.log(`Local patients after import: ${finalCount.count}`);
} finally {
    db.close();
}
