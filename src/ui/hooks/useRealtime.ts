import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Realtime Subscription Hook
 * 
 * Sets up realtime data change listeners (IPC for Host, Socket.IO for Clients)
 * that automatically invalidate TanStack Query cache when data changes occur.
 */
export function useRealtime() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // 1. Local IPC Listener (Always try, works for Host windows)
        let unsubscribeIPC: (() => void) | undefined;
        if (window.electronAPI?.onDataChanged) {
            unsubscribeIPC = window.electronAPI.onDataChanged((data) => {
                const payload = typeof data === 'string' ? { resource: data } : data;
                console.log(`[IPC] Data changed: ${payload.resource}`);
                handleResourceChange(payload);
            });
        }

        // 2. Socket.IO Listener (For Network Clients and cross-machine sync)
        let socket: any;

        const setupSocket = async () => {
            try {
                // Get config to find host IP
                const { config } = await window.electronAPI.checkSetup();
                const port = config.serverPort || 3001;
                const ip = config.serverIP || 'localhost';
                const url = `http://${ip}:${port}`;

                console.log(`🔌 [Socket.IO] Connecting to ${url}...`);
                socket = io(url, {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 10
                });

                socket.on('connect', () => {
                    console.log('✅ [Socket.IO] Connected to synchronization server');
                });

                socket.on('data-changed', (data: any) => {
                    const payload = typeof data === 'string' ? { resource: data } : data;
                    console.log(`🌐 [Socket.IO] Data changed: ${payload.resource}`);
                    handleResourceChange(payload);
                });

                socket.on('connect_error', (error: any) => {
                    console.warn('⚠️ [Socket.IO] Connection error:', error.message);
                });

            } catch (error) {
                console.error('❌ [Socket.IO] Setup failed:', error);
            }
        };

        setupSocket();

        // 3. Centralized Change Handler
        const handleResourceChange = (payload: { resource: string, id?: string }) => {
            const { resource, id } = payload;
            
            if (id) {
                queryClient.invalidateQueries({ queryKey: [resource, 'active'] });
                queryClient.invalidateQueries({ queryKey: [resource, 'list'] });
            } else {
                queryClient.invalidateQueries({ queryKey: [resource] });
            }

            // Special handling for dependent queries
            if (resource === 'appointments' || resource === 'waitlist' || resource === 'consultations' || resource === 'payments') {
                queryClient.invalidateQueries({ queryKey: ['todayStats'] });
                queryClient.invalidateQueries({ queryKey: ['resume'] });
            }

            if (resource === 'consultations') {
                queryClient.invalidateQueries({ queryKey: ['consultations', 'last-completed'] });
            }
        };

        return () => {
            if (unsubscribeIPC) unsubscribeIPC();
            if (socket) {
                console.log('🔌 [Socket.IO] Disconnecting...');
                socket.disconnect();
            }
        };
    }, [queryClient]);
}
