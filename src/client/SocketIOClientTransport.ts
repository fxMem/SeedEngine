import * as io from 'socket.io-client';
import { TransportMessage, TransportClient } from '../transport/Transport';
import { SeedMessage, DefaultSeedNamespace } from '../transport/Headers';
import { ManualResetEvent } from '../utils/ManualResetEvent';
import { ClientTransport, TransportConnectionErrorCallback } from './ClientTransport';

// Wraps socket.IO connection (client)
export class SocketIOClientTransport implements ClientTransport {

    private connection: SocketIOClient.Socket;
    private connected: ManualResetEvent;

    start(): void {
        this.connection = io.connect(`http://localhost:8080/${DefaultSeedNamespace}`, {
            timeout: 5_000,
            reconnectionDelay: 2000
        });
        this.connected = new ManualResetEvent();
    }

    send(message: TransportMessage, options: any): void {
        this.connected.wait().then(() => {
            this.connection.emit(SeedMessage, message);
        });
    }

    isStarted(): boolean {
        return !!this.connection;
    }

    onConnected(userCallback: (client: TransportClient) => void) {
        this.connection.on('connect', () => {
            this.connected.set();

            userCallback({
                id: this.connection.id,
                onMessage: (callback) => {
                    this.connection.on(SeedMessage, callback);
                },
                onDisconnected: (callback) => {
                    this.connection.on('disconnect', callback);
                }
            });
        });
    }

    onConnectionError(userCallback: TransportConnectionErrorCallback): void {
        this.connection.on('connect_error', () => {
            userCallback();
        });

        this.connection.on('reconnect_error', () => {
            userCallback();
        });
    }
}