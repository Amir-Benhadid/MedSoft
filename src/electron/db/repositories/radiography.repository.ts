/**
 * Radiography Repository
 * 
 * Provides database operations for managing radiography document definitions
 * and their associated field definitions.
 */

import { getDatabase } from '../database.js';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// --- Zod Schemas ---

export const RadiographyFieldDefinitionSchema = z.object({
    id: z.string(),
    document_definition_id: z.string(),
    label: z.string(),
    default_values: z.array(z.string()).optional(), // Encoded as JSON string in DB
    created_at: z.string().optional(),
});

export const RadiographyDocumentDefinitionSchema = z.object({
    id: z.string(),
    title: z.string(),
    fields: z.array(RadiographyFieldDefinitionSchema).optional(),
    created_at: z.string().optional(),
});

export type RadiographyFieldDefinition = z.infer<typeof RadiographyFieldDefinitionSchema>;
export type RadiographyDocumentDefinition = z.infer<typeof RadiographyDocumentDefinitionSchema>;

/**
 * Repository for managing radiography document templates.
 */
export class RadiographyRepository {
    private get db() {
        return getDatabase();
    }

    /**
     * Lists all document definitions with their fields.
     */
    findAllDocuments(): RadiographyDocumentDefinition[] {
        const docs = this.db.prepare(`
            SELECT * FROM radiography_document_definitions 
            ORDER BY title ASC
        `).all() as any[];

        const fields = this.db.prepare(`
            SELECT * FROM radiography_field_definitions
        `).all() as any[];

        // Map fields to docs
        const fieldsByDoc = fields.reduce((acc, field) => {
            const docId = field.document_definition_id;
            if (!acc[docId]) acc[docId] = [];

            // Parse default_values from JSON string
            let parsedValues: string[] = [];
            try {
                if (field.default_values) {
                    parsedValues = JSON.parse(field.default_values);
                }
            } catch (e) {
                console.warn(`Failed to parse default_values for field ${field.id}`, e);
            }

            acc[docId].push({
                ...field,
                default_values: parsedValues
            });
            return acc;
        }, {} as Record<string, RadiographyFieldDefinition[]>);

        return docs.map(doc => ({
            ...doc,
            fields: fieldsByDoc[doc.id] || []
        }));
    }

    /**
     * Creates a new document definition.
     */
    createDocument(title: string): RadiographyDocumentDefinition {
        const id = randomUUID();
        this.db.prepare(`
            INSERT INTO radiography_document_definitions (id, title)
            VALUES (?, ?)
        `).run(id, title);

        return { id, title, fields: [] };
    }

    /**
     * Update document title
     */
    updateDocument(id: string, title: string) {
        this.db.prepare(`
            UPDATE radiography_document_definitions SET title = ? WHERE id = ?
        `).run(title, id);
    }


    /**
     * Deletes a document definition (cascade deletes fields).
     */
    deleteDocument(id: string): void {
        this.db.prepare('DELETE FROM radiography_document_definitions WHERE id = ?').run(id);
    }

    /**
     * Creates a field definition.
     */
    createField(docId: string, label: string, defaultValues: string[] = []): RadiographyFieldDefinition {
        const id = randomUUID();
        const jsonValues = JSON.stringify(defaultValues);

        this.db.prepare(`
            INSERT INTO radiography_field_definitions (id, document_definition_id, label, default_values)
            VALUES (?, ?, ?, ?)
        `).run(id, docId, label, jsonValues);

        return {
            id,
            document_definition_id: docId,
            label,
            default_values: defaultValues
        };
    }

    /**
     * Updates a field definition.
     * Note: Full replace of values.
     */
    updateField(id: string, data: { label?: string, default_values?: string[] }) {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.label !== undefined) {
            fields.push('label = ?');
            values.push(data.label);
        }
        if (data.default_values !== undefined) {
            fields.push('default_values = ?');
            values.push(JSON.stringify(data.default_values));
        }

        if (fields.length === 0) return;

        values.push(id);
        const stmt = this.db.prepare(`UPDATE radiography_field_definitions SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...values);
    }

    /**
     * Deletes a field definition.
     */
    deleteField(id: string): void {
        this.db.prepare('DELETE FROM radiography_field_definitions WHERE id = ?').run(id);
    }
}
