-- Migration generated from Supabase schema

CREATE TABLE IF NOT EXISTS "images" (
  "id" UUID NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "consultation_id" UUID NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "consultations" (
  "id" UUID NOT NULL PRIMARY KEY,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "notes" TEXT,
  "diagnosis" TEXT,
  "prescription" TEXT,
  "duration" INTEGER,
  "clinical_exam" TEXT,
  "dilatation_required" BOOLEAN,
  "left_eye" TEXT,
  "right_eye" TEXT,
  "detailed_clinical_exam" TEXT,
  "secretary_needed" BOOLEAN,
  "secretary_note" TEXT,
  "follow_up" BOOLEAN,
  "consultation_type" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "patient_id" UUID NOT NULL,
  "tonometrie_data" TEXT,
  "consultation_reason" TEXT,
  "inspection_od_og" TEXT,
  "diagnosis_od_og" TEXT,
  "general_medical_history" TEXT,
  "ophthalmological_history" TEXT,
  "motility_exam" TEXT,
  "gonioscopy_notes" TEXT,
  "medical_imaging_notes" TEXT,
  "motility_exam_od_og" TEXT,
  "treatment_plan_od_og" TEXT,
  "anterior_segment_od_og" TEXT,
  "fundus_od_og" TEXT,
  "next_appointment" TEXT,
  "contact_lens_data" TEXT,
  "medical_imaging_data" TEXT,
  "tonometrie_left_eye" TEXT,
  "tonometrie_right_eye" TEXT,
  "documents_data" TEXT,
  "type" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "contacts" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "specialization" TEXT,
  "organization" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "fax" TEXT,
  "email" TEXT,
  "website" TEXT,
  "emergency_phone" TEXT,
  "address" TEXT,
  "schedule" TEXT,
  "services" JSONB,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "medicines" (
  "id" UUID NOT NULL PRIMARY KEY,
  "medication_name" TEXT NOT NULL,
  "strength" TEXT,
  "type" TEXT,
  "packaging" TEXT,
  "instructions" TEXT,
  "category" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE,
  "updated_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "tarifs" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL NOT NULL,
  "category" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL,
  "duration" INTEGER,
  "code" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" UUID NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
  "patient_id" UUID,
  "patient_name" TEXT,
  "notes" TEXT,
  "status" TEXT,
  "state" TEXT,
  "is_group" BOOLEAN,
  "group_patient_ids" TEXT,
  "consultation_type" TEXT,
  "needs_dilation" BOOLEAN,
  "is_dilated" BOOLEAN,
  "dilation_status" TEXT,
  "dilation_completed_at" TIMESTAMP WITH TIME ZONE,
  "arrived_at" TIMESTAMP WITH TIME ZONE,
  "consultation_start" TIMESTAMP WITH TIME ZONE,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "payment_info" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "dilation_type" TEXT,
  "type" INTEGER
);

CREATE TABLE IF NOT EXISTS "antecedents" (
  "id" UUID NOT NULL PRIMARY KEY,
  "description" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "type" TEXT NOT NULL,
  "patient_id" UUID NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "workflow_events" (
  "id" UUID NOT NULL PRIMARY KEY,
  "event_type" TEXT NOT NULL,
  "patient_id" UUID,
  "appointment_id" UUID,
  "consultation_id" UUID,
  "metadata" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "lentille_conv" (
  "id" INTEGER NOT NULL PRIMARY KEY,
  "num_enr" INTEGER NOT NULL,
  "idtab_conversion" INTEGER NOT NULL,
  "lunettes" DECIMAL NOT NULL,
  "lun_plus" DECIMAL,
  "lun_moins" DECIMAL
);

CREATE TABLE IF NOT EXISTS "todo_items" (
  "id" UUID NOT NULL PRIMARY KEY,
  "text" TEXT NOT NULL,
  "is_completed" BOOLEAN,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "date" DATE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" UUID NOT NULL PRIMARY KEY,
  "base_price" DECIMAL NOT NULL,
  "discount" DECIMAL,
  "is_free" BOOLEAN,
  "total" DECIMAL NOT NULL,
  "paid" DECIMAL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "consultation_id" UUID NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "waitlist_entries" (
  "id" UUID NOT NULL PRIMARY KEY,
  "arrived_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "date" DATE,
  "patient_id" UUID NOT NULL,
  "needs_dilation" BOOLEAN,
  "is_dilated" BOOLEAN,
  "dilation_completed_at" TIMESTAMP WITH TIME ZONE,
  "dilation_status" TEXT,
  "state" TEXT,
  "consultation_start" TIMESTAMP WITH TIME ZONE,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "is_finished" BOOLEAN,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "dilation_type" TEXT
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID NOT NULL PRIMARY KEY,
  "text" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "is_read" BOOLEAN,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" UUID NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "consultation_id" UUID NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "patients" (
  "id" UUID NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "surname" TEXT NOT NULL,
  "dob" DATE NOT NULL,
  "address" TEXT,
  "phone_number" TEXT,
  "phoneNumber" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "blood_type" TEXT,
  "consultation_start" TIMESTAMP WITH TIME ZONE,
  "medical_history" TEXT,
  "needs_dilation" BOOLEAN,
  "is_dilated" BOOLEAN,
  "dilation_status" TEXT,
  "dilation_completed_at" TIMESTAMP WITH TIME ZONE,
  "consultation_data" TEXT,
  "payment_info" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "personne" TEXT
);

