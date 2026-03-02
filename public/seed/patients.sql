-- Seeding Script for Test Patients
-- Usage: sqlite3 cabinet-medical.db < public/seed/patients.sql

BEGIN TRANSACTION;

-- 1. Patients (10 Test Patients)
INSERT OR IGNORE INTO patients (id, name, surname, dob, phone_number, created_at, updated_at) VALUES 
('p1', 'Alice', 'Smith', '1970-01-01', '0550000000', datetime('now'), datetime('now')),
('p2', 'Bob', 'Jones', '1971-01-01', '0550000001', datetime('now'), datetime('now')),
('p3', 'Charlie', 'Williams', '1972-01-01', '0550000002', datetime('now'), datetime('now')),
('p4', 'David', 'Brown', '1973-01-01', '0550000003', datetime('now'), datetime('now')),
('p5', 'Eva', 'Taylor', '1974-01-01', '0550000004', datetime('now'), datetime('now')),
('p6', 'Frank', 'Davies', '1975-01-01', '0550000005', datetime('now'), datetime('now')),
('p7', 'Grace', 'Evans', '1976-01-01', '0550000006', datetime('now'), datetime('now')),
('p8', 'Hannah', 'Wilson', '1977-01-01', '0550000007', datetime('now'), datetime('now')),
('p9', 'Isaac', 'Thomas', '1978-01-01', '0550000008', datetime('now'), datetime('now')),
('p10', 'Jack', 'Roberts', '1979-01-01', '0550000009', datetime('now'), datetime('now'));

-- 2. Appointments (3 Scheduled for Today at 9:00, 10:00, 11:00)
INSERT INTO appointments (id, patient_id, start_time, end_time, title, state, type, consultation_type_id, created_at, updated_at) VALUES 
('appt1', 'p1', date('now') || 'T09:00:00', date('now') || 'T10:00:00', 'Consultation Smith', 'present', 'consultation', 1, datetime('now'), datetime('now')),
('appt2', 'p2', date('now') || 'T10:00:00', date('now') || 'T11:00:00', 'Consultation Jones', 'present', 'consultation', 1, datetime('now'), datetime('now')),
('appt3', 'p3', date('now') || 'T11:00:00', date('now') || 'T12:00:00', 'Consultation Williams', 'present', 'consultation', 1, datetime('now'), datetime('now'));

-- 3. Waitlist Entries (2 Walk-ins Today at 8:30, 9:30)
INSERT INTO waitlist_entries (id, patient_id, arrived_at, state, type, consultation_type_id, created_at, updated_at) VALUES 
('wait1', 'p4', date('now') || 'T08:30:00', 'waiting', 'consultation', 1, datetime('now'), datetime('now')),
('wait2', 'p5', date('now') || 'T09:30:00', 'waiting', 'consultation', 1, datetime('now'), datetime('now'));

-- 4. Completed Consultations & Invoices (3 Completed Today for Resume testing)
-- Note: Assuming table 'consultations' might not exist in Secretary mode, but 'invoices' always does.
-- If running manually, user might need to adjust if schema is strictly secretary, but this SQL assumes standard schema or handles errors gracefully if ignored.

-- Consultations (p6, p7, p8)
-- We use INSERT OR IGNORE to avoid failure if table is missing (though in SQLite script, it might error if table missing completely. 
-- Ideally this is run on a full DB. If Secretary mode, 'consultations' table doesn't exist, so this part would fail. 
-- But standard SQL script usually assumes tables exist. I will verify if I can wrap in check but SQLite SQL scripts don't have IF TABLE EXISTS blocks easily without dynamic SQL.
-- I will assume standard schema for manual seeding or that the user knows.
-- However, to be safe, I'll insert into invoices first which always exists.

INSERT INTO invoices (id, consultation_id, patient_id, amount, total, paid, type, method, consultation_type_id, created_at, updated_at) VALUES 
('inv1', 'cons1', 'p6', 3000, 3000, 3000, 'standard', 'cash', 1, date('now') || 'T14:00:00', date('now') || 'T14:00:00'),
('inv2', 'cons2', 'p7', 3000, 3000, 3000, 'standard', 'cash', 1, date('now') || 'T15:00:00', date('now') || 'T15:00:00'),
('inv3', 'cons3', 'p8', 3000, 3000, 3000, 'standard', 'cash', 1, date('now') || 'T16:00:00', date('now') || 'T16:00:00');

-- Try to insert consultations if they match invoice IDs (For Doctor/Full mode)
-- If table doesn't exist, this block will fail the script execution if run as single batch. 
-- But commonly one would ignore errors or this script is intended for the full app.
INSERT OR IGNORE INTO consultations (id, patient_id, date, type, status, created_at, updated_at) VALUES 
('cons1', 'p6', date('now') || 'T14:00:00', 'Consultation', 'completed', date('now') || 'T14:00:00', datetime('now')),
('cons2', 'p7', date('now') || 'T15:00:00', 'Consultation', 'completed', date('now') || 'T15:00:00', datetime('now')),
('cons3', 'p8', date('now') || 'T16:00:00', 'Consultation', 'completed', date('now') || 'T16:00:00', datetime('now'));

COMMIT;
