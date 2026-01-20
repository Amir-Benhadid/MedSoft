/**
 * Todos Router
 * 
 * Provides ORPC endpoints for managing todo items, including listing,
 * creating, toggling completion status, and deleting todos.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { TodoRepository } from '../../db/repositories/todo.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const todoSchema = z.object({
    id: z.string(),
    text: z.string(),
    is_completed: z.boolean(),
    priority: z.enum(['normal', 'high']),
    created_at: z.string(),
    completed_at: z.string().nullable()
});

export const todosRouter = os.router({
    /**
     * Lists todo items, optionally including completed ones.
     *
     * @param input.includeCompleted - Whether to include completed todos (default: false)
     * @returns Array of todo items
     */
    list: os
        .input(
            z.object({
                includeCompleted: z.boolean().default(false)
            }).optional()
        )
        .output(z.array(todoSchema))
        .handler(async ({ input }) => {
            const repo = new TodoRepository();
            return repo.list(input?.includeCompleted ?? false);
        }),

    /**
     * Creates a new todo item.
     *
     * @param input.text - Todo text content
     * @param input.priority - Priority level (default: 'normal')
     * @returns Created todo item
     */
    create: os
        .input(
            z.object({
                text: z.string(),
                priority: z.enum(['normal', 'high']).default('normal')
            })
        )
        .output(todoSchema)
        .handler(async ({ input }) => {
            const repo = new TodoRepository();
            const result = repo.create(input.text, input.priority as 'normal' | 'high');
            broadcastChange('todos');
            return result;
        }),

    /**
     * Toggles the completion status of a todo item.
     *
     * @param input.id - Todo ID
     * @param input.isCompleted - New completion status
     * @returns Success indicator
     * @throws Error if todo not found
     */
    toggle: os
        .input(
            z.object({
                id: z.string(),
                isCompleted: z.boolean()
            })
        )
        .output(z.object({ success: z.boolean() }))
        .handler(async ({ input }) => {
            const repo = new TodoRepository();
            const success = repo.toggle(input.id, input.isCompleted);
            if (!success) {
                throw new Error('Todo not found');
            }
            broadcastChange('todos');
            return { success };
        }),

    /**
     * Deletes a todo item.
     *
     * @param input.id - Todo ID
     * @returns Success indicator
     */
    delete: os
        .input(z.object({ id: z.string() }))
        .output(z.object({ success: z.boolean() }))
        .handler(async ({ input }) => {
            const repo = new TodoRepository();
            const success = repo.delete(input.id);
            broadcastChange('todos');
            return { success };
        })
});
