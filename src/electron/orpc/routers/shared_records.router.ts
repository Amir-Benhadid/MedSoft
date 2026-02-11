import { os } from '@orpc/server';
import { z } from 'zod';
import { SharedRecordRepository } from '../../db/repositories/shared_record.repository.js';
import { broadcastChange } from '../../lib/broadcast.js';

const sharedRecordSchema = z.object({
    id: z.string(),
    patient_id: z.string(),
    sender: z.enum(['DOCTOR', 'SECRETARY']),
    receiver: z.enum(['DOCTOR', 'SECRETARY']),
    status: z.enum(['unread', 'read', 'archived']),
    created_at: z.string(),
    updated_at: z.string(),
    patient_name: z.string().optional(),
    patient_surname: z.string().optional(),
    patient_dob: z.string().optional().nullable(),
    patient_gen_ants: z.string().optional().nullable(),
});

export const sharedRecordsRouter = os.router({
    list: os
        .input(z.object({ receiver: z.enum(['DOCTOR', 'SECRETARY']), limit: z.number().optional() }))
        .output(z.array(sharedRecordSchema))
        .handler(async ({ input }) => {
            const repo = new SharedRecordRepository();
            return repo.list(input.receiver, input.limit);
        }),

    create: os
        .input(z.object({
            patientId: z.string(),
            sender: z.enum(['DOCTOR', 'SECRETARY']),
            receiver: z.enum(['DOCTOR', 'SECRETARY'])
        }))
        .output(sharedRecordSchema)
        .handler(async ({ input }) => {
            const repo = new SharedRecordRepository();
            const result = repo.create(input.patientId, input.sender, input.receiver);
            broadcastChange('sharedRecords');
            return result;
        }),

    countUnread: os
        .input(z.object({ receiver: z.enum(['DOCTOR', 'SECRETARY']) }))
        .output(z.object({ count: z.number() }))
        .handler(async ({ input }) => {
            const repo = new SharedRecordRepository();
            return { count: repo.countUnread(input.receiver) };
        }),

    markAsRead: os
        .input(z.object({ ids: z.array(z.string()) }))
        .handler(async ({ input }) => {
            const repo = new SharedRecordRepository();
            const success = repo.markAsRead(input.ids);
            if (success) {
                broadcastChange('sharedRecords');
            }
            return { success };
        }),

    delete: os
        .input(z.object({ id: z.string() }))
        .handler(async ({ input }) => {
            const repo = new SharedRecordRepository();
            const success = repo.delete(input.id);
            if (success) {
                broadcastChange('sharedRecords');
            }
            return { success };
        })
});
