import * as io from 'socket.io-client';
import { ManualResetEvent } from '../utils';
import { DefaultSeedNamespace, TransportMessage, SeedMessage, TransportClient, Transport } from '../transport';

// Wraps socket.IO connection (client)
export class SocketIOClientTransport implements Transport {
    
    private connection: SocketIOClient.Socket;
    private connected: ManualResetEvent;

    start(): void {
        this.connection = io.connect(`http://localhost:8080/${DefaultSeedNamespace}`);
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
}