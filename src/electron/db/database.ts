/**
 * SQLite Database Setup
 * 
 * Uses better-sqlite3 for synchronous, fast database access.
 * Handles database initialization, schema setup, and migrations.
 */

import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';

/**
 * Application configuration interface.
 */
export interface AppConfig {
	businessName?: string;
	businessType?: 'cabinet-ophthalmologie' | 'kinesis' | string;
	appMode?: string;
	serverMode?: string;
	dbPath?: string;
	logoPath?: string;
	[key: string]: any;
}

let db: Database.Database | null = null;
let currentConfig: AppConfig = {};

/**
 * Gets or creates the database instance.
 * The database file is stored in the user's app data directory or a custom path from config.
 * Enables WAL mode and foreign keys, then runs schema setup and migrations.
 *
 * @returns The database instance
 * @throws Error if in client mode (local DB initialization is blocked)
 */
export function getDatabase(): Database.Database {
	if (db) {
		return db;
	}

	const userDataPath = app.getPath('userData');
	const configPath = path.join(userDataPath, 'config.json');

	let dbPath = path.join(userDataPath, 'cabinet-medical.db');
	let config: AppConfig = {};

	try {
		if (fs.existsSync(configPath)) {
			config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

			if (config.serverMode === 'client') {
				console.warn('⚠️ Client mode detected: Local database will NOT be initialized.');
				throw new Error('Local database initialization blocked in Client mode.');
			}

			if (config.dbPath) {
				dbPath = path.join(config.dbPath, 'cabinet-medical.db');
			}
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes('blocked in Client mode')) {
			throw error;
		}
		console.warn('⚠️ Could not read config.json, using default DB path', error);
	}

	currentConfig = config;
	console.log(`📦 Database path: ${dbPath}`);

	db = new Database(dbPath);

	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	console.log('✅ Database initialized');

	setupDatabase(db, config);
	runMigrations(db, config);

	return db;
}

/**
 * Gets the current application configuration.
 *
 * @returns The current AppConfig object
 */
export function getConfig(): AppConfig {
	return currentConfig;
}

/**
 * Sets up the database schema based on business type and app mode.
 * Creates core tables and business-specific tables. Handles secretary mode
 * by removing consultation-related tables.
 *
 * @param database - The database instance
 * @param config - The application configuration
 */
function setupDatabase(database: Database.Database, config: AppConfig) {
	const isSecretary = config.appMode === 'secretary';

	database.exec(getCoreSchema(isSecretary));

	if (isSecretary) {
		console.log('🔒 Secretary specific setup processing...');

		try {
			const invoicesInfo = database.prepare("PRAGMA table_info(invoices)").all() as any[];
			const hasPatientId = invoicesInfo.some(c => c.name === 'patient_id');
			const hasConsultations = !!database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='consultations'").get();

			if (!hasPatientId) {
				console.log('Migrating invoices: Adding patient_id column...');
				database.prepare("ALTER TABLE invoices ADD COLUMN patient_id TEXT").run();
			}

			if (hasConsultations && hasPatientId) { // Check hasPatientId just to be safe if alter failed silently
				console.log('Backfilling invoice patient_ids from consultations...');
				// We only backfill where patient_id is NULL to avoid overwriting (though it should be null if just added)
				database.prepare(`
                    UPDATE invoices 
                    SET patient_id = (
                        SELECT patient_id FROM consultations WHERE consultations.id = invoices.consultation_id
                    )
                    WHERE patient_id IS NULL
                 `).run();
			}
		} catch (error) {
			console.error('Error during secretary data preservation:', error);
		}

		// 2. Remove FK from invoices if it exists (Rebuild table)
		// We do this to ensure no hard dependency on consultations table
		try {
			const invoicesInfo = database.prepare("PRAGMA foreign_key_list(invoices)").all() as any[];
			const hasConsultationFK = invoicesInfo.some(fk => fk.table === 'consultations');
			const actualTableInfo = database.prepare("PRAGMA table_info(invoices)").all() as any[];
			const hasPatientId = actualTableInfo.some(c => c.name === 'patient_id');

			// Also check if we need to rebuild because we just added patient_id (schema update) 
			// or if we simply want to sanitize the table definition.
			if (hasConsultationFK || !hasPatientId) {
				console.log('🔒 Rebuilding invoices table for Secretary Mode (removing FK, ensuring patient_id)...');
				database.transaction(() => {
					// Rename current
					database.exec("ALTER TABLE invoices RENAME TO invoices_old");

					// Create new (Secretary version)
					database.exec(`
                        CREATE TABLE invoices (
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
                            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                        )
                     `);

					// Copy data
					// Note: invoices_old might NOT have patient_id if we failed to add it earlier?
					// We try to carry over patient_id if it exists, otherwise leave null (which is bad but better than crash)
					const oldInfo = database.prepare("PRAGMA table_info(invoices_old)").all() as any[];
					const oldHasPatient = oldInfo.some(c => c.name === 'patient_id');

					if (oldHasPatient) {
						database.exec(`
                            INSERT INTO invoices (id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at)
                            SELECT id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at 
                            FROM invoices_old
                        `);
					} else {
						// Fallback: Copy without patient_id (it will be NULL in new table)
						database.exec(`
                            INSERT INTO invoices (id, consultation_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at)
                            SELECT id, consultation_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at 
                            FROM invoices_old
                        `);
					}

					// Drop old
					database.exec("DROP TABLE invoices_old");
				})();
			}
		} catch (error) {
			console.error('Error rebuilding invoices for secretary mode:', error);
		}

		// 3. Drop Consultation Tables
		console.log('🔒 Dropping consultation tables...');
		database.exec(`
            DROP TABLE IF EXISTS eye_measurements;
            DROP TABLE IF EXISTS clinical_exams;
            DROP TABLE IF EXISTS consultations; 
        `);
	}

	const type = config.businessType || 'cabinet-ophthalmologie';

	if (type === 'cabinet-ophthalmologie' && !isSecretary) {
		database.exec(getOphthalmologySchema());
		seedDatabase(database);
	} else if (type === 'kinesis' && !isSecretary) {
		database.exec(getKinesisSchema());
	}



	console.log(`✅ Database schema initialized for type: ${type} (Mode: ${config.appMode})`);

	try {
		const tableInfo = database.prepare("PRAGMA table_info(appointments)").all() as any[];
		const columns = tableInfo.map((c) => c.name);

		if (columns.includes('needs_dilation')) {
			console.log('Migrating appointments: removing needs_dilation');
			database.exec('ALTER TABLE appointments DROP COLUMN needs_dilation');
		}
		if (columns.includes('dilation_status')) {
			console.log('Migrating appointments: removing dilation_status');
			database.exec('ALTER TABLE appointments DROP COLUMN dilation_status');
		}
	} catch (error) {
		console.warn('Migration warning: Could not drop columns from appointments logic (might be old sqlite version or already dropped)', error);
	}
}

function getCoreSchema(isSecretary: boolean = false): string {
	// If secretary, we don't create consultations table, so Invoices shouldn't reference it.

	return `
		CREATE TABLE IF NOT EXISTS migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		-- Settings table for app configuration
		CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		-- Appointments Table
		-- Optimized for reading calendar views (range queries on start_time)
		CREATE TABLE IF NOT EXISTS appointments (
			id TEXT PRIMARY KEY,
			patient_id TEXT NOT NULL,
			start_time TEXT NOT NULL, -- ISO8601, no timezone
			end_time TEXT NOT NULL,   -- ISO8601, no timezone
			arrived_at TEXT,          -- ISO8601, no timezone
			title TEXT,
			state TEXT NOT NULL DEFAULT 'booked',
			type TEXT DEFAULT 'consultation',
			notes TEXT,
            consultation_type_id INTEGER,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);

		-- Indices for performance
		CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
		CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);

		-- Patients Table
		CREATE TABLE IF NOT EXISTS patients (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			surname TEXT NOT NULL,
			dob TEXT,               -- YYYY-MM-DD
			phone_number TEXT,
			street TEXT,
			city TEXT,
			oph_ants TEXT,          -- Ophthalmological antecedents
			gen_ants TEXT,          -- General antecedents
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);

		-- Index for patient name search
		CREATE INDEX IF NOT EXISTS idx_patients_name_surname ON patients(name, surname);

		-- Waitlist Entries Table
		CREATE TABLE IF NOT EXISTS waitlist_entries (
			id TEXT PRIMARY KEY,
			patient_id TEXT NOT NULL,
			arrived_at TEXT NOT NULL, -- ISO8601
			state TEXT NOT NULL DEFAULT 'waiting', -- waiting, in_consultation, completed, etc.
			type TEXT DEFAULT 'consultation',
			notes TEXT,
            consultation_type_id INTEGER,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (patient_id) REFERENCES patients(id)
		);

		CREATE INDEX IF NOT EXISTS idx_waitlist_arrived_at ON waitlist_entries(arrived_at);

		-- Example table (replace with your actual schema)
		CREATE TABLE IF NOT EXISTS example_table (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		-- Messages Table
		CREATE TABLE IF NOT EXISTS messages (
			id TEXT PRIMARY KEY,
			text TEXT NOT NULL,
			sender TEXT NOT NULL, -- 'SECRETARY' or 'DOCTOR'
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

		-- Todos Table
		CREATE TABLE IF NOT EXISTS todos (
			id TEXT PRIMARY KEY,
			text TEXT NOT NULL,
			is_completed INTEGER DEFAULT 0, -- 0 for false, 1 for true
			priority TEXT DEFAULT 'normal', -- 'normal', 'high'
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			completed_at TEXT, -- ISO8601, null if not completed
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
        
        ${!isSecretary ? `
		-- Appointments Table
        -- (Already created above, but here assuming consultations exists if not secretary)
        
        -- Invoices Table (FK handled dynamically)
        CREATE TABLE IF NOT EXISTS invoices (
			id TEXT PRIMARY KEY,
			consultation_id TEXT NOT NULL,
            patient_id TEXT, -- Added for direct linkage
			amount REAL NOT NULL,
			total REAL DEFAULT 0,
			paid REAL DEFAULT 0,
			type TEXT, -- 'standard', 'free'
			method TEXT DEFAULT 'cash',
			consultation_type_id INTEGER,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
		);
        ` : `
        -- Secretary Mode Invoices (No FK to consultations)
        CREATE TABLE IF NOT EXISTS invoices (
			id TEXT PRIMARY KEY,
			consultation_id TEXT NOT NULL, -- Just an ID reference, not a Constraint
            patient_id TEXT,
			amount REAL NOT NULL,
			total REAL DEFAULT 0,
			paid REAL DEFAULT 0,
			type TEXT, -- 'standard', 'free'
			method TEXT DEFAULT 'cash',
			consultation_type_id INTEGER,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
        `}

		-- Consultation Types Table (Dynamic Pricing)
		CREATE TABLE IF NOT EXISTS consultation_types (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			label TEXT NOT NULL,
			amount REAL NOT NULL,
			color TEXT DEFAULT '#3b82f6', -- default blue
			is_active INTEGER DEFAULT 1,
			nature TEXT DEFAULT 'normal', -- normal or radiography
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);

		-- Seed Consultation Types if empty
		INSERT OR IGNORE INTO consultation_types (id, label, amount, color) VALUES 
        (1, 'Consultation Standard', 3000, '#3b82f6'),
		(2, 'Contrôle', 1500, '#10b981');

		-- Autocomplete Options Table
		CREATE TABLE IF NOT EXISTS autocomplete_options (
			id TEXT PRIMARY KEY,
			category TEXT NOT NULL,
			value TEXT NOT NULL,
			frequency INTEGER DEFAULT 0,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_autocomplete_category ON autocomplete_options(category);

		-- Professional Contacts Table (Doctors, Clinics, etc.)
		CREATE TABLE IF NOT EXISTS professional_contacts (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			type TEXT DEFAULT 'Doctor', -- Doctor, Clinic, Laboratory, Optician, etc.
			specialty TEXT,
			address TEXT,
			phone TEXT,
			email TEXT,
			notes TEXT,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP
		);
		CREATE INDEX IF NOT EXISTS idx_professional_contacts_name ON professional_contacts(name);
	`;
}

function getOphthalmologySchema(): string {
	return `
		-- Dilations Table
		-- Links to either an appointment OR a waitlist entry
		CREATE TABLE IF NOT EXISTS dilations (
			id TEXT PRIMARY KEY,
			appointment_id TEXT,
			waitlist_entry_id TEXT,
			patient_id TEXT NOT NULL, -- Denormalized for easier access
			medicine TEXT,            -- e.g. 'Mydriaticum', 'Tropicamide'
			status TEXT DEFAULT 'pending', -- pending, dilated, etc.
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
			FOREIGN KEY (waitlist_entry_id) REFERENCES waitlist_entries(id) ON DELETE CASCADE,
			FOREIGN KEY (patient_id) REFERENCES patients(id)
		);

		CREATE INDEX IF NOT EXISTS idx_dilations_appointment_id ON dilations(appointment_id);
		CREATE INDEX IF NOT EXISTS idx_dilations_waitlist_entry_id ON dilations(waitlist_entry_id);

		-- Medicines Table
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

		-- Lentille Conversion Table
		CREATE TABLE IF NOT EXISTS lentille_conv (
			id TEXT PRIMARY KEY,
			num_enr TEXT,
			idtab_conversion TEXT,
			lunettes REAL,
			lun_plus TEXT,
			lun_moins TEXT
		);
	`;
}

function getKinesisSchema(): string {
	return `
		-- Kinesis specific tables placeholder
		-- e.g. sessions, body_charts
	`;
}

export function seedDatabase(db: Database.Database) {
	try {
		if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='medicines'").get()) {
			// Skip seeding if table doesn't exist (e.g. secretary mode)
			return;
		}

		// Check if medicines seeded
		const medCount = db.prepare('SELECT count(*) as count FROM medicines').get() as { count: number };
		if (medCount.count === 0) {
			console.log('🌱 Seeding medicines...');
			const seedPath = path.join(process.cwd(), 'public', 'seed', 'medecines.sql');
			if (fs.existsSync(seedPath)) {
				let sql = fs.readFileSync(seedPath, 'utf-8');
				// Fix Postgres schema syntax for SQLite
				sql = sql.replace(/"public"\./g, '');
				db.exec(sql);
				console.log('✅ Medicines seeded.');
			} else {
				console.warn('⚠️ Medicines seed file not found at', seedPath);
			}
		}

		// Check if conversion seeded
		if (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='lentille_conv'").get()) {
			const convCount = db.prepare('SELECT count(*) as count FROM lentille_conv').get() as { count: number };
			if (convCount.count === 0) {
				console.log('🌱 Seeding conversions...');
				const seedPath = path.join(process.cwd(), 'public', 'seed', 'conversion.sql');
				if (fs.existsSync(seedPath)) {
					let sql = fs.readFileSync(seedPath, 'utf-8');
					// Fix Postgres schema syntax for SQLite
					sql = sql.replace(/"public"\./g, '');
					db.exec(sql);
					console.log('✅ Conversions seeded.');
				} else {
					console.warn('⚠️ Conversion seed file not found at', seedPath);
				}
			}
		}

	} catch (error) {
		console.error('❌ Seeding failed:', error);
	}
}

/**
 * Runs database migrations to update schema for existing databases.
 * Handles schema optimizations and data migrations safely.
 *
 * @param db - The database instance
 * @param config - The application configuration
 */
function runMigrations(db: Database.Database, config: AppConfig) {
	const isSecretary = config.appMode === 'secretary';

	const migrationName = '001_optimize_consultations_v3';
	const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);

	if (!exists && !isSecretary) {
		console.log(`🚀 Running migration: ${migrationName}`);
		try {
			db.transaction(() => {
				const consultationsInfo = db.prepare("PRAGMA table_info(consultations)").all() as any[];
				const hasOldTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='consultations_old'").get();

				// Case 1: Fresh Database (No consultations table)
				if (consultationsInfo.length === 0 && !hasOldTable) {
					console.log('Fresh install: Creating optimized schema directly.');
					createOptimizedSchema(db, config.businessType);
				}
				// Case 2: Legacy Database (Has consultations with left_eye)
				else if (consultationsInfo.some(c => c.name === 'left_eye')) {
					console.log('Legacy DB detected: Migrating...');
					db.exec('ALTER TABLE consultations RENAME TO consultations_old');
					createOptimizedSchema(db, config.businessType);
					migrateData(db);
				}
				// Case 3: Failed/Partial Migration (Has consultations_old, but maybe bad new tables)
				else if (hasOldTable) {
					console.log('Partial migration detected: Resetting and re-migrating...');
					// Drop potential bad tables
					db.exec('DROP TABLE IF EXISTS consultations');
					db.exec('DROP TABLE IF EXISTS eye_measurements');
					db.exec('DROP TABLE IF EXISTS clinical_exams');

					createOptimizedSchema(db, config.businessType);
					migrateData(db);
				}
				// Case 4: Already Optimized (No left_eye, no old table) - Just ensure schema
				else {
					console.log('DB seems optimized. Ensuring schema...');
					createOptimizedSchema(db, config.businessType);
				}

				db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
			})();
			console.log(`✅ Migration ${migrationName} completed successfully`);
		} catch (error) {
			console.error(`❌ Migration ${migrationName} failed:`, error);
			throw error;
		}
	} else if (!exists && isSecretary) {
		db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
	}

	if (!isSecretary) {
		fixInvoicesSchema(db);
	} else {
		// Mark as applied
		const mName = '002_fix_invoices_fk';
		if (!db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(mName)) {
			db.prepare('INSERT INTO migrations (name) VALUES (?)').run(mName);
		}
	}

	addConsultationTypeToScheduling(db);
	addNatureToConsultationTypes(db);
	addRadiographyDocumentSchema(db, config);
}

function addRadiographyDocumentSchema(db: Database.Database, config: AppConfig) {
	const type = config.businessType || 'cabinet-ophthalmologie';
	if (type !== 'cabinet-ophthalmologie') return;

	const migrationName = '005_add_radiography_document_tables';
	const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);

	if (!exists) {
		console.log(`🚀 Running migration: ${migrationName}`);
		try {
			db.transaction(() => {
				db.exec(`
					CREATE TABLE IF NOT EXISTS radiography_document_definitions (
						id TEXT PRIMARY KEY,
						title TEXT NOT NULL,
						created_at DATETIME DEFAULT CURRENT_TIMESTAMP
					);

					CREATE TABLE IF NOT EXISTS radiography_field_definitions (
						id TEXT PRIMARY KEY,
						document_definition_id TEXT NOT NULL,
						label TEXT NOT NULL,
						default_values TEXT, -- JSON array of strings
						created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
						FOREIGN KEY(document_definition_id) REFERENCES radiography_document_definitions(id) ON DELETE CASCADE
					);
				`);
				db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
			})();
			console.log(`✅ Migration ${migrationName} completed successfully`);
		} catch (error) {
			console.error(`❌ Migration ${migrationName} failed:`, error);
		}
	}
}

function addNatureToConsultationTypes(db: Database.Database) {
	const migrationName = '004_add_nature_to_consultation_types';
	const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);

	if (!exists) {
		console.log(`🚀 Running migration: ${migrationName}`);
		try {
			db.transaction(() => {
				const info = db.prepare("PRAGMA table_info(consultation_types)").all() as any[];
				if (!info.some(c => c.name === 'nature')) {
					db.exec("ALTER TABLE consultation_types ADD COLUMN nature TEXT DEFAULT 'normal'");
				}
				db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
			})();
			console.log(`✅ Migration ${migrationName} completed successfully`);
		} catch (error) {
			console.error(`❌ Migration ${migrationName} failed:`, error);
		}
	}
}

function fixInvoicesSchema(db: Database.Database) {
	const migrationName = '002_fix_invoices_fk';
	const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);

	if (!exists) {
		console.log(`🚀 Running migration: ${migrationName}`);
		try {
			db.transaction(() => {
				// Check if invoices table exists
				const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'").get();
				if (tableInfo) {
					console.log('Rebuilding invoices table to ensure correct FKs...');

					// We also ensure patient_id column exists here for Non-Secretary mode regular migration
					// to keep schemas consistent.

					// 1. Create new table
					db.exec(`
                        CREATE TABLE invoices_new (
                            id TEXT PRIMARY KEY,
                            consultation_id TEXT NOT NULL,
                            patient_id TEXT, -- Ensure patient_id
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

					// Check if old invoices has patient_id
					const oldInfo = db.prepare("PRAGMA table_info(invoices)").all() as any[];
					const hasPatientId = oldInfo.some(c => c.name === 'patient_id');

					// 2. Copy data
					if (hasPatientId) {
						db.exec(`
                            INSERT INTO invoices_new (id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at)
                            SELECT id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at FROM invoices;
                        `);
					} else {
						// Attempt to backfill patient_id from consultations since we can join here
						// Can't join in INSERT SELECT easily with complex logic in one go efficiently without risk
						// So just copy without patient_id first, then update
						db.exec(`
                            INSERT INTO invoices_new (id, consultation_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at)
                            SELECT id, consultation_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at FROM invoices;
                        `);

						// Backfill
						db.exec(`
                             UPDATE invoices_new 
                             SET patient_id = (SELECT patient_id FROM consultations WHERE consultations.id = invoices_new.consultation_id)
                        `);
					}

					// 3. Drop old and rename
					db.exec('DROP TABLE invoices');
					db.exec('ALTER TABLE invoices_new RENAME TO invoices');
				}

				db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
			})();
			console.log(`✅ Migration ${migrationName} completed successfully`);
		} catch (error) {
			console.error(`❌ Migration ${migrationName} failed:`, error);
		}
	}
}

function addConsultationTypeToScheduling(db: Database.Database) {
	const migrationName = '003_add_consultation_type_to_scheduling';
	const exists = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(migrationName);

	if (!exists) {
		console.log(`🚀 Running migration: ${migrationName}`);
		try {
			db.transaction(() => {
				// Appointments
				const appInfo = db.prepare("PRAGMA table_info(appointments)").all() as any[];
				if (!appInfo.some(c => c.name === 'consultation_type_id')) {
					db.exec('ALTER TABLE appointments ADD COLUMN consultation_type_id INTEGER');
				}

				// Waitlist
				const waitlistInfo = db.prepare("PRAGMA table_info(waitlist_entries)").all() as any[];
				if (!waitlistInfo.some(c => c.name === 'consultation_type_id')) {
					db.exec('ALTER TABLE waitlist_entries ADD COLUMN consultation_type_id INTEGER');
				}

				db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
			})();
			console.log(`✅ Migration ${migrationName} completed successfully`);
		} catch (error) {
			console.error(`❌ Migration ${migrationName} failed:`, error);
		}
	}
}

function createOptimizedSchema(db: Database.Database, businessType?: string) {
	db.exec(`
		-- 1. Main Consultations Table (Slimmed)
		CREATE TABLE IF NOT EXISTS consultations (
			id TEXT PRIMARY KEY,
			patient_id TEXT NOT NULL,
			date TEXT NOT NULL,
			type TEXT DEFAULT 'Consultation',
			status TEXT DEFAULT 'pending',
			documents_data TEXT, -- Keeping as JSON for now
			prescription TEXT DEFAULT '{}', -- Keeping as JSON for now (restored)
			created_at TEXT DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (patient_id) REFERENCES patients(id)
		);
		CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
        CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(date DESC);
	`);

	// Tables for Ophthalmology
	if (!businessType || businessType === 'cabinet-ophthalmologie') {
		db.exec(`
			-- 2. Eye Measurements (Normalized)
			CREATE TABLE IF NOT EXISTS eye_measurements (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				consultation_id TEXT NOT NULL,
				eye TEXT NOT NULL CHECK (eye IN ('left', 'right')),
				
				-- Refraction
				sph REAL,
				cyl REAL,
				axis REAL,
				add_val REAL, 
				
				-- Tonometry
				tension REAL,
				pachymetry REAL,
				
				-- Metadata
				visual_acuity TEXT, 
				
				-- Full JSON blob for anything that doesn't fit specific columns (Hybrid approach)
				raw_data TEXT, 

				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS idx_eye_measurements_consultation ON eye_measurements(consultation_id);
			CREATE INDEX IF NOT EXISTS idx_eye_measurements_tension ON eye_measurements(tension);

			-- 3. Clinical Exams (Normalized-ish)
			CREATE TABLE IF NOT EXISTS clinical_exams (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				consultation_id TEXT NOT NULL,
				
				diagnosis TEXT,
				notes TEXT,
				
				-- Detailed JSON for complex structures (anterior segment, fundus, etc.)
				raw_data TEXT, 
				
				created_at TEXT DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
			);
			CREATE INDEX IF NOT EXISTS idx_clinical_exams_consultation ON clinical_exams(consultation_id);
		`);
	}
}

function migrateData(db: Database.Database) {
	const oldRows = db.prepare('SELECT * FROM consultations_old').all() as any[];
	const insertConsultation = db.prepare(`
		INSERT INTO consultations (id, patient_id, date, type, status, documents_data, prescription, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
	const insertEye = db.prepare(`
		INSERT INTO eye_measurements (consultation_id, eye, sph, cyl, axis, add_val, tension, pachymetry, visual_acuity, raw_data)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`);
	const insertExam = db.prepare(`
		INSERT INTO clinical_exams (consultation_id, diagnosis, notes, raw_data)
		VALUES (?, ?, ?, ?)
	`);

	for (const row of oldRows) {
		// 1. Consultation
		insertConsultation.run(
			row.id, row.patient_id, row.date, row.type, row.status, row.documents_data, row.prescription || '{}', row.created_at, row.updated_at
		);

		// 2. Eyes
		const processEye = (eyePrefix: string, eyeName: 'left' | 'right') => {
			try {
				const data = JSON.parse(row[eyePrefix] || '{}');
				insertEye.run(
					row.id,
					eyeName,
					parseFloat(data.sph) || null,
					parseFloat(data.cyl) || null,
					parseFloat(data.axis) || null,
					parseFloat(data.add) || null,
					parseFloat(data.tension) || null,
					parseFloat(data.pachymetry) || null,
					data.visualAcuity || null,
					row[eyePrefix] // Save raw JSON just in case
				);
			} catch (e) {
				console.warn(`Failed to parse ${eyeName} eye for ${row.id}`, e);
			}
		};
		processEye('left_eye', 'left');
		processEye('right_eye', 'right');

		// 3. Clinical Exam
		try {
			const data = JSON.parse(row.clinical_exam || '{}');
			insertExam.run(
				row.id,
				data.diagnosis || '',
				'', // notes
				row.clinical_exam
			);
		} catch (e) {
			console.warn(`Failed to parse clinical exam for ${row.id}`, e);
		}
	}
}

/**
 * Closes the database connection.
 * Should be called when the app is shutting down to ensure data integrity.
 */
export function closeDatabase() {
	if (db) {
		db.close();
		db = null;
		console.log('✅ Database connection closed');
	}
}
