/**
 * Books Router
 * 
 * Provides ORPC endpoints for managing PDF books and folders in the books directory.
 * Supports listing files/folders, creating folders, and opening the books directory.
 */

import { z } from 'zod';
import { os } from '@orpc/server';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Gets the books directory path, creating it if it doesn't exist.
 * Reads configuration to determine the base path.
 *
 * @returns Path to the books directory
 */
const getBooksDir = () => {
    const userDataPath = app.getPath('userData');
    let basePath = userDataPath;

    try {
        const configPath = path.join(userDataPath, 'config.json');
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(configData);
            if (config && config.dbPath) {
                basePath = config.dbPath;
            }
        }
    } catch (e) {
        console.error('Failed to read config for books router:', e);
    }

    const booksDir = path.join(basePath, 'books');
    if (!fs.existsSync(booksDir)) {
        fs.mkdirSync(booksDir, { recursive: true });
    }
    return booksDir;
};

export const FileItemSchema = z.object({
    name: z.string(),
    type: z.enum(['file', 'folder']),
    relativePath: z.string(),
    url: z.string().optional(),
    size: z.number().optional(),
    createdAt: z.string(),
});

export const booksRouter = os.router({
    /**
     * Lists files and folders in the books directory.
     *
     * @param input.path - Relative path within books directory (default: empty string for root)
     * @returns Array of file and folder items, sorted with folders first
     */
    list: os
        .input(z.object({ path: z.string().default('') }))
        .output(z.array(FileItemSchema))
        .handler(async ({ input }) => {
            const rootDir = getBooksDir();
            const safePath = input.path.replace(/\.\./g, '');
            const currentDir = path.join(rootDir, safePath);

            if (!fs.existsSync(currentDir)) {
                return [];
            }

            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            return entries
                .map(entry => {
                    const relativePath = path.join(safePath, entry.name).replace(/\\/g, '/');
                    const fullPath = path.join(currentDir, entry.name);

                    if (entry.isDirectory()) {
                        const stats = fs.statSync(fullPath);
                        return {
                            name: entry.name,
                            type: 'folder' as const,
                            relativePath,
                            createdAt: stats.birthtime.toISOString()
                        };
                    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
                        const stats = fs.statSync(fullPath);
                        return {
                            name: entry.name,
                            type: 'file' as const,
                            relativePath,
                            url: `books://${encodeURIComponent(relativePath)}`,
                            size: stats.size,
                            createdAt: stats.birthtime.toISOString()
                        };
                    }
                    return null;
                })
                .filter((item) => item !== null)
                .sort((a, b) => {
                    if (!a || !b) return 0;
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'folder' ? -1 : 1;
                }) as z.infer<typeof FileItemSchema>[];
        }),

    /**
     * Creates a new folder in the books directory.
     *
     * @param input.path - Parent directory path
     * @param input.name - Folder name
     */
    createFolder: os
        .input(z.object({ path: z.string(), name: z.string() }))
        .handler(async ({ input }) => {
            const rootDir = getBooksDir();
            const safePath = input.path.replace(/\.\./g, '');
            const newFolderPath = path.join(rootDir, safePath, input.name);

            if (!fs.existsSync(newFolderPath)) {
                fs.mkdirSync(newFolderPath, { recursive: true });
            }
        }),

    /**
     * Opens the books directory in the system file manager.
     */
    openFolder: os.handler(async () => {
        const dir = getBooksDir();
        await import('electron').then(electron => electron.shell.openPath(dir));
    }),

    /**
     * Seeds the books directory (placeholder for future implementation).
     */
    seed: os.handler(async () => {
    })
});
