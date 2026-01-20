import dgram from 'dgram';
import { networkInterfaces } from 'os';

const BROADCAST_PORT = 41234;
const BROADCAST_INTERVAL = 3000;

/**
 * Represents a discovered Cabinet Medical server on the network.
 */
export interface DiscoveredService {
    ip: string;
    port: number;
    name: string;
    lastSeen: number;
}

/**
 * Broadcasts server presence on the local network using UDP multicast.
 * Allows other instances to discover this server.
 */
export class ServiceBroadcaster {
    private socket: dgram.Socket | null = null;
    private timer: NodeJS.Timeout | null = null;
    private name: string;
    private httpPort: number;

    /**
     * Creates a new ServiceBroadcaster instance.
     *
     * @param name - The server name to broadcast
     * @param httpPort - The HTTP port the server is listening on
     */
    constructor(name: string, httpPort: number) {
        this.name = name;
        this.httpPort = httpPort;
    }

    /**
     * Starts broadcasting server presence on the network.
     * Sends discovery packets at regular intervals.
     */
    start() {
        if (this.socket) return;

        console.log('📡 Starting Service Broadcaster...');
        this.socket = dgram.createSocket('udp4');

        this.socket.bind(() => {
            this.socket?.setBroadcast(true);
            console.log('📡 Broadcaster bound and ready');
        });

        const message = JSON.stringify({
            type: 'CABINET_MEDICAL_DISCOVERY',
            name: this.name,
            port: this.httpPort
        });

        const broadcast = () => {
            if (!this.socket) return;
            const buffer = Buffer.from(message);
            this.socket.send(buffer, 0, buffer.length, BROADCAST_PORT, '255.255.255.255', (err) => {
                if (err) console.error('Broadcast error:', err);
            });
        };

        broadcast();
        this.timer = setInterval(broadcast, BROADCAST_INTERVAL);
    }

    /**
     * Stops broadcasting and closes the UDP socket.
     */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        console.log('📡 Service Broadcaster stopped');
    }
}

/**
 * Scans the local network for Cabinet Medical servers.
 * Listens for UDP broadcast packets from ServiceBroadcaster instances.
 */
export class ServiceScanner {
    private socket: dgram.Socket | null = null;
    private services: Map<string, DiscoveredService> = new Map();
    private isScanning = false;

    /**
     * Starts scanning for servers on the network.
     *
     * @param onServiceFound - Optional callback invoked when a new service is discovered
     */
    start(onServiceFound?: (services: DiscoveredService[]) => void) {
        if (this.isScanning) return;

        this.services.clear();
        this.isScanning = true;

        console.log('🔍 Starting Service Scanner...');
        this.socket = dgram.createSocket('udp4');

        this.socket.on('message', (msg, rinfo) => {
            console.log(`🔍 Scanner received packet from ${rinfo.address}:${rinfo.port} - ${msg.length} bytes`);
            try {
                const data = JSON.parse(msg.toString());
                console.log('📦 Packet data:', data);
                if (data.type === 'CABINET_MEDICAL_DISCOVERY') {
                    const key = `${rinfo.address}:${data.port}`;
                    const service: DiscoveredService = {
                        ip: rinfo.address,
                        port: data.port,
                        name: data.name,
                        lastSeen: Date.now()
                    };

                    const isNew = !this.services.has(key);
                    this.services.set(key, service);

                    if (isNew && onServiceFound) {
                        console.log('✅ New service found:', service);
                        onServiceFound(Array.from(this.services.values()));
                    }
                }
            } catch (e) {
                console.warn('⚠️ Ignored invalid discovery packet', e);
            }
        });

        this.socket.on('error', (err) => {
            console.error('🔍 Scanner socket error:', err);
            this.stop();
        });

        this.socket.bind(BROADCAST_PORT, () => {
            console.log(`🔍 Scanner listening on port ${BROADCAST_PORT}`);
        });
    }

    /**
     * Gets all currently discovered services, filtering out stale entries.
     * Services not seen in the last 10 seconds are excluded.
     *
     * @returns Array of active discovered services
     */
    getServices(): DiscoveredService[] {
        const now = Date.now();
        const activeServices = Array.from(this.services.values()).filter(s => now - s.lastSeen < 10000);
        return activeServices;
    }

    /**
     * Stops scanning and closes the UDP socket.
     */
    stop() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isScanning = false;
        console.log('🔍 Service Scanner stopped');
    }
}

/**
 * Gets the local IP address of this machine.
 * Returns the first non-internal IPv4 address found, or '127.0.0.1' as fallback.
 *
 * @returns The local IP address string
 */
export function getLocalIP(): string {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}
