
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Use absolute path to the live application database in AppData
const DB_PATH = path.join('C:', 'Users', 'amirb', 'AppData', 'Roaming', 'cabinet', 'cabinet-medical.db');
const SAMPLES_DIR = path.join(process.cwd(), 'supabase_samples');

console.log(`📂 Database Path: ${DB_PATH}`);
console.log(`📂 Samples Directory: ${SAMPLES_DIR}`);

const db = new Database(DB_PATH);

function readSample(tableName: string) {
    const filePath = path.join(SAMPLES_DIR, `${tableName}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    console.warn(`⚠️ Sample not found: ${tableName}`);
    return [];
}

function safeStringify(obj: any) {
    if (!obj) return null;
    return JSON.stringify(obj);
}

function run() {
    console.log('🧹 Clearing & Initializing Schema...');
    // Disable FKs temporarily
    db.pragma('foreign_keys = OFF');

    db.transaction(() => {
        // Drop all known tables
        const tables = [
            'dilations', 'invoices', 'clinical_exams', 'eye_measurements',
            'consultations', 'waitlist_entries', 'appointments',
            'patients', 'medicines', 'lentille_conv', 'settings', 'migrations',
            'consultation_types', 'autocomplete_options', 'professional_contacts',
            'todos', 'messages'
        ];
        for (const table of tables) {
            db.exec(`DROP TABLE IF EXISTS ${table}`);
        }

        // --- Schema Creation ---

        // Patients
        db.exec(`
            CREATE TABLE IF NOT EXISTS patients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                surname TEXT NOT NULL,
                dob TEXT,
                phone_number TEXT,
                street TEXT,
                city TEXT,
                oph_ants TEXT,
                gen_ants TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_patients_name_surname ON patients(name, surname);
        `);

        // Appointments
        db.exec(`
            CREATE TABLE IF NOT EXISTS appointments (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                arrived_at TEXT,
                title TEXT,
                state TEXT NOT NULL DEFAULT 'booked',
                type TEXT DEFAULT 'consultation',
                notes TEXT,
                consultation_type_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
            CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
        `);

        // Waitlist
        db.exec(`
            CREATE TABLE IF NOT EXISTS waitlist_entries (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                arrived_at TEXT NOT NULL,
                state TEXT NOT NULL DEFAULT 'waiting',
                type TEXT DEFAULT 'consultation',
                notes TEXT,
                consultation_type_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );
            CREATE INDEX IF NOT EXISTS idx_waitlist_arrived_at ON waitlist_entries(arrived_at);
        `);

        // Consultations
        db.exec(`
            CREATE TABLE IF NOT EXISTS consultations (
                id TEXT PRIMARY KEY,
                patient_id TEXT NOT NULL,
                date TEXT NOT NULL,
                type TEXT DEFAULT 'Consultation',
                status TEXT DEFAULT 'pending',
                documents_data TEXT,
                prescription TEXT DEFAULT '{}',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );
            CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
            CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date DESC);
        `);

        // Eye Measurements
        db.exec(`
            CREATE TABLE IF NOT EXISTS eye_measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                consultation_id TEXT NOT NULL,
                eye TEXT NOT NULL CHECK (eye IN ('left', 'right')),
                sph REAL, cyl REAL, axis REAL, add_val REAL, 
                tension REAL, pachymetry REAL, visual_acuity TEXT, 
                raw_data TEXT, 
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_eye_measurements_consultation ON eye_measurements(consultation_id);
        `);

        // Clinical Exams
        db.exec(`
            CREATE TABLE IF NOT EXISTS clinical_exams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                consultation_id TEXT NOT NULL,
                diagnosis TEXT,
                notes TEXT,
                raw_data TEXT, 
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
            );
            CREATE INDEX IF NOT EXISTS idx_clinical_exams_consultation ON clinical_exams(consultation_id);
        `);

        // Invoices
        db.exec(`
            CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                consultation_id TEXT NOT NULL,
                patient_id TEXT,
                amount REAL NOT NULL,
                total REAL DEFAULT 0,
                paid REAL DEFAULT 0,
                type TEXT,
                method TEXT DEFAULT 'cash',
                consultation_type_id INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
            );
        `);

        // --- MISSING TABLES FROM PREVIOUS RUN ---

        // Dilations
        db.exec(`
             CREATE TABLE IF NOT EXISTS dilations (
                id TEXT PRIMARY KEY,
                appointment_id TEXT,
                waitlist_entry_id TEXT,
                patient_id TEXT NOT NULL,
                medicine TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
                FOREIGN KEY (waitlist_entry_id) REFERENCES waitlist_entries(id) ON DELETE CASCADE,
                FOREIGN KEY (patient_id) REFERENCES patients(id)
            );
            CREATE INDEX IF NOT EXISTS idx_dilations_appointment_id ON dilations(appointment_id);
            CREATE INDEX IF NOT EXISTS idx_dilations_waitlist_entry_id ON dilations(waitlist_entry_id);
        `);

        // Medicines
        db.exec(`
            CREATE TABLE IF NOT EXISTS medicines (
                id TEXT PRIMARY KEY,
                medication_name TEXT NOT NULL,
                strength TEXT,
                type TEXT,
                packaging TEXT,
                instructions TEXT,
                category TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Lentille Conversion
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

        // Consultation Types
        db.exec(`
            CREATE TABLE IF NOT EXISTS consultation_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                label TEXT NOT NULL,
                amount REAL NOT NULL,
                color TEXT DEFAULT '#3b82f6',
                is_active INTEGER DEFAULT 1,
                nature TEXT DEFAULT 'normal',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            INSERT OR IGNORE INTO consultation_types (id, label, amount, color) VALUES 
                (1, 'Consultation Standard', 3000, '#3b82f6'),
                (2, 'Contrôle', 1500, '#10b981'),
                (3, 'Urgence', 4000, '#ef4444'),
                (4, 'OCT', 5000, '#8b5cf6'),
                (5, 'Lasik', 150000, '#f59e0b');
        `);

        // Autocomplete Options
        db.exec(`
            CREATE TABLE IF NOT EXISTS autocomplete_options (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                value TEXT NOT NULL,
                frequency INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_autocomplete_category ON autocomplete_options(category);
        `);

        // Professional Contacts
        db.exec(`
            CREATE TABLE IF NOT EXISTS professional_contacts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'Doctor',
                specialty TEXT,
                address TEXT,
                phone TEXT,
                email TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_professional_contacts_name ON professional_contacts(name);
        `);

        // Todos
        db.exec(`
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                is_completed INTEGER DEFAULT 0,
                priority TEXT DEFAULT 'normal',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
        `);

        // Messages
        db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                text TEXT NOT NULL,
                sender TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        `);

        // Settings & Migrations
        db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
             CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

    })();

    db.pragma('foreign_keys = ON');
    console.log('✅ Schema created.');

    // --- DEDUPLICATION HELPERS ---
    const toTitleCase = (str: string) => {
        if (!str) return '';
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    };

    const normalizeStr = (str: string) => {
        if (!str) return '';
        return str.trim().toLowerCase().replace(/\s+/g, ' ');
    };

    const levenshtein = (s1: string, s2: string): number => {
        const a = s1 || '';
        const b = s2 || '';
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const getBirthYear = (dob: string | null, age: number | null): number | null => {
        if (dob) {
            const d = new Date(dob);
            if (!isNaN(d.getFullYear())) return d.getFullYear();
        }
        if (age !== null && age !== undefined) {
            return new Date().getFullYear() - age;
        }
        return null;
    };

    const seedProcessedIds = new Set<string>();
    const idMap = new Map<string, string>();

    // Index existing patients (which we just created or might be empty if dropped tables - checking anyway)
    // In this script we DROP tables first, so technically we start clean.
    // BUT the user might want this logic to handle duplicates WITHIN the JSON file itself.
    // Also, if we don't drop tables (user might comment out drops), it's good to have.
    // Since we drop tables at line 44, db is empty initially.
    // The main value here is intra-file deduplication.

    interface PatientParams {
        id: string;
        normName: string;
        normSurname: string;
        birthYear: number | null;
    }
    const localPatientsIndex: Record<string, PatientParams[]> = {};

    const addToIndex = (p: PatientParams) => {
        const key = p.normSurname.slice(0, 1);
        if (!localPatientsIndex[key]) localPatientsIndex[key] = [];
        localPatientsIndex[key].push(p);
    };

    const findDuplicate = (normName: string, normSurname: string, birthYear: number | null): string | null => {
        const key = normSurname.slice(0, 1);
        const candidates = localPatientsIndex[key] || [];

        for (const candidate of candidates) {
            const surnameDist = (candidate.normSurname === normSurname) ? 0 : levenshtein(candidate.normSurname, normSurname);
            const nameDist = (candidate.normName === normName) ? 0 : levenshtein(candidate.normName, normName);

            if (normSurname.length < 3 && surnameDist > 0) continue;
            if (normName.length < 3 && nameDist > 0) continue;

            if (surnameDist <= 2 && nameDist <= 2) {
                if (birthYear && candidate.birthYear) {
                    if (Math.abs(birthYear - candidate.birthYear) <= 1) {
                        return candidate.id;
                    }
                } else if (!birthYear || !candidate.birthYear) {
                    if (surnameDist <= 1 && nameDist <= 1) {
                        return candidate.id;
                    }
                }
            }
        }
        return null;
    };

    const ensurePatient = (id: string): string | null => {
        const mapped = idMap.get(id);
        if (mapped) return mapped;
        if (seedProcessedIds.has(id)) return id;

        // Check DB as fallback
        try {
            const exists = db.prepare('SELECT 1 FROM patients WHERE id = ?').get(id);
            if (exists) return id;
        } catch (e) { }

        return null;
    };

    // 1. Patients
    const patients = readSample('patients');
    console.log(`👤 Seeding ${patients.length} patients...`);
    const insertPatient = db.prepare(`
        INSERT OR IGNORE INTO patients (id, name, surname, dob, phone_number, street, city, gen_ants, created_at, updated_at)
        VALUES (@id, @name, @surname, @dob, @phone_number, @street, @city, @gen_ants, @created_at, @updated_at)
    `);

    db.transaction(() => {
        let dups = 0;
        for (const p of patients) {
            const normName = normalizeStr(p.name);
            const normSurname = normalizeStr(p.surname);
            const birthYear = getBirthYear(p.dob, p.age);

            const duplicateId = findDuplicate(normName, normSurname, birthYear);
            if (duplicateId) {
                // Duplicate found within this batch (since DB was cleared)
                // console.log(`Duplicate: ${p.name} ${p.surname} -> ${duplicateId}`);
                idMap.set(p.id, duplicateId);
                dups++;
                continue;
            }

            const finalName = toTitleCase(p.name);
            const finalSurname = toTitleCase(p.surname);
            const finalCity = p.address ? toTitleCase(p.address.city || '') : '';

            insertPatient.run({
                id: p.id,
                name: finalName,
                surname: finalSurname,
                dob: p.dob,
                phone_number: p.phone_number || p.phone,
                street: p.address ? (p.address.street || '') : '',
                city: finalCity,
                gen_ants: p.medical_history,
                created_at: p.created_at,
                updated_at: p.updated_at
            });
            seedProcessedIds.add(p.id);

            addToIndex({
                id: p.id,
                normName,
                normSurname,
                birthYear
            });
        }
        console.log(`Dedup: Skipped ${dups} duplicates.`);
    })();

    // 2. Appointments
    const appointments = readSample('appointments');
    console.log(`📅 Seeding ${appointments.length} appointments...`);
    const insertAppointment = db.prepare(`
        INSERT OR IGNORE INTO appointments (id, patient_id, start_time, end_time, arrived_at, title, state, type, notes, created_at, updated_at)
        VALUES (@id, @patient_id, @start_time, @end_time, @arrived_at, @title, @state, @type, @notes, @created_at, @updated_at)
    `);

    db.transaction(() => {
        for (const a of appointments) {
            const pid = ensurePatient(a.patient_id);
            if (!pid) continue;

            let state = a.state || 'booked';
            if (state === 'paid') state = 'completed';
            if (a.status === 'SCHEDULED' && state === 'booked') state = 'booked';

            insertAppointment.run({
                id: a.id,
                patient_id: pid,
                start_time: a.start_time,
                end_time: a.end_time,
                arrived_at: a.arrived_at,
                title: a.title,
                state: state,
                type: 'consultation', // Default
                notes: a.notes,
                created_at: a.created_at,
                updated_at: a.updated_at
            });
        }
    })();

    // 3. Consultations
    const consultations = readSample('consultations');
    console.log(`🩺 Seeding ${consultations.length} consultations...`);

    const insertConsult = db.prepare(`
        INSERT OR IGNORE INTO consultations (id, patient_id, date, type, status, documents_data, prescription, created_at, updated_at)
        VALUES (@id, @patient_id, @date, @type, @status, @documents_data, @prescription, @created_at, @updated_at)
    `);

    const insertEye = db.prepare(`
        INSERT INTO eye_measurements (consultation_id, eye, sph, cyl, axis, add_val, tension, pachymetry, visual_acuity, raw_data)
        VALUES (@consultation_id, @eye, @sph, @cyl, @axis, @add_val, @tension, @pachymetry, @visual_acuity, @raw_data)
    `);

    const insertExam = db.prepare(`
        INSERT INTO clinical_exams (consultation_id, diagnosis, notes, raw_data)
        VALUES (@consultation_id, @diagnosis, @notes, @raw_data)
    `);

    db.transaction(() => {
        for (const c of consultations) {
            const pid = ensurePatient(c.patient_id);
            if (!pid) continue;

            insertConsult.run({
                id: c.id,
                patient_id: pid,
                date: c.date || c.created_at,
                type: 'Consultation',
                status: 'completed',
                documents_data: safeStringify(c.documents_data || {}),
                prescription: c.prescription || '{}',
                created_at: c.created_at,
                updated_at: c.updated_at
            });

            const processEye = (eyeData: any, side: 'left' | 'right') => {
                if (!eyeData) return;
                insertEye.run({
                    consultation_id: c.id,
                    eye: side,
                    sph: parseFloat(eyeData.sph) || null,
                    cyl: parseFloat(eyeData.cyl) || null,
                    axis: parseFloat(eyeData.axis) || null,
                    add_val: parseFloat(eyeData.add || eyeData.add_val) || null,
                    tension: parseFloat(eyeData.tension) || null,
                    pachymetry: parseFloat(eyeData.pachymetry) || null,
                    visual_acuity: eyeData.visualAcuity || eyeData.visual_acuity || null,
                    raw_data: JSON.stringify(eyeData)
                });
            };

            processEye(c.left_eye, 'left');
            processEye(c.right_eye, 'right');

            const examData = c.detailed_clinical_exam || {};

            // Extract diagnosis from various places
            let diagnosis = c.diagnosis || examData.diagnosis || '';
            // Sometimes diagnosis is in detailed_clinical_exam.diagnosisOD or diagnosisOG or general diagnosis
            if (!diagnosis && examData.diagnosisOD) diagnosis += "OD: " + examData.diagnosisOD + " ";
            if (!diagnosis && examData.diagnosisOG) diagnosis += "OG: " + examData.diagnosisOG + " ";

            insertExam.run({
                consultation_id: c.id,
                diagnosis: diagnosis.trim(),
                notes: c.notes || '',
                raw_data: JSON.stringify(examData)
            });
        }
    })();

    // 4. Invoices
    const invoices = readSample('invoices');
    console.log(`💰 Seeding ${invoices.length} invoices...`);
    const insertInvoice = db.prepare(`
        INSERT OR IGNORE INTO invoices (id, consultation_id, patient_id, amount, total, paid, type, method, created_at, updated_at)
        VALUES (@id, @consultation_id, @patient_id, @amount, @total, @paid, @type, @method, @created_at, @updated_at)
    `);

    db.transaction(() => {
        for (const inv of invoices) {
            // Because we might have remapped patient IDs, we need to be careful.
            // Invoices usually link to consultation_id.
            // If consultation was inserted, it has the CORRECT (resolved) patient_id.
            // So we should fetch it from there if possible.

            const cExists = db.prepare('SELECT patient_id FROM consultations WHERE id = ?').get(inv.consultation_id) as any;

            if (!cExists) {
                continue;
            }

            // This patientId is already the resolved one because consultations used ensurePatient
            let patientId = cExists.patient_id;

            insertInvoice.run({
                id: inv.id,
                consultation_id: inv.consultation_id,
                patient_id: patientId,
                amount: inv.base_price || 0,
                total: inv.total || 0,
                paid: inv.paid || 0,
                type: inv.is_free ? 'free' : 'standard',
                method: 'cash',
                created_at: inv.created_at,
                updated_at: inv.created_at || new Date().toISOString()
            });
        }
    })();

    // Count stats
    console.log('--- Stats ---');
    console.log('Patients:', (db.prepare('SELECT count(*) as c FROM patients').get() as any).c);
    console.log('Appointments:', (db.prepare('SELECT count(*) as c FROM appointments').get() as any).c);
    console.log('Consultations:', (db.prepare('SELECT count(*) as c FROM consultations').get() as any).c);
    console.log('Invoices:', (db.prepare('SELECT count(*) as c FROM invoices').get() as any).c);

    console.log('✨ Seed complete!');
}

run();
