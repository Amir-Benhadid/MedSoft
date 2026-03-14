
import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'MedSoft', 'database.sqlite');
const db = new Database(dbPath);

const types = db.prepare('SELECT id, label, nature FROM consultation_types').all();
console.log('--- Consultation Types ---');
console.log(JSON.stringify(types, null, 2));

const waitlist = db.prepare('SELECT id, patient_id, consultation_type_id FROM waitlist_entries LIMIT 5').all();
console.log('--- Waitlist (last 5) ---');
console.log(JSON.stringify(waitlist, null, 2));

const appointments = db.prepare('SELECT id, patient_id, consultation_type_id FROM appointments LIMIT 5').all();
console.log('--- Appointments (last 5) ---');
console.log(JSON.stringify(appointments, null, 2));

db.close();
