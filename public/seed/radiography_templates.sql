-- Radiography Document Templates
CREATE TABLE IF NOT EXISTS radiography_document_definitions (
    id TEXT PRIMARY KEY, -- UUID or Slug
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS radiography_field_definitions (
    id TEXT PRIMARY KEY, -- UUID
    document_definition_id TEXT NOT NULL,
    label TEXT NOT NULL,
    default_values TEXT, -- JSON array of strings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(document_definition_id) REFERENCES radiography_document_definitions(id) ON DELETE CASCADE
);
