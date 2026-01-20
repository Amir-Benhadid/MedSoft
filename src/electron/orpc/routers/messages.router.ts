/**
 * Messages Router
 * 
 * Provides ORPC endpoints for managing internal messages, including sending,
 * listing today's messages, counting unread messages, and marking messages as read.
 */

import { os } from '@orpc/server';
import { z } from 'zod';
import { MessageRepository } from '../../db/repositories/message.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const messageSchema = z.object({
    id: z.string(),
    text: z.string(),
    sender: z.string(),
    created_at: z.string(),
    is_read: z.boolean()
});

export const messagesRouter = os.router({
    /**
     * Lists all messages from today.
     *
     * @returns Array of today's messages
     */
    list: os
        .output(z.array(messageSchema))
        .handler(async () => {
            const repo = new MessageRepository();
            return repo.listToday();
        }),

    /**
     * Sends a new message.
     *
     * @param input.text - Message text content
     * @param input.sender - Sender identifier
     * @returns Created message
     */
    send: os
        .input(
            z.object({
                text: z.string(),
                sender: z.string()
            })
        )
        .output(messageSchema)
        .handler(async ({ input }) => {
            const repo = new MessageRepository();
            const result = repo.create(input.text, input.sender);
            broadcastChange('messages');
            return result;
        }),

    /**
     * Counts unread messages from today for a specific sender.
     *
     * @param input.sender - Sender identifier
     * @returns Object with count of unread messages
     */
    countUnread: os
        .input(z.object({ sender: z.string() }))
        .output(z.object({ count: z.number() }))
        .handler(async ({ input }) => {
            const repo = new MessageRepository();
            return { count: repo.countUnread(input.sender) };
        }),

    /**
     * Marks multiple messages as read.
     *
     * @param input.ids - Array of message IDs to mark as read
     * @returns Success indicator
     */
    markAsRead: os
        .input(z.object({ ids: z.array(z.string()) }))
        .handler(async ({ input }) => {
            const repo = new MessageRepository();
            const success = repo.markAsRead(input.ids);
            if (success) {
                broadcastChange('messages');
            }
            return { success };
        })
});
