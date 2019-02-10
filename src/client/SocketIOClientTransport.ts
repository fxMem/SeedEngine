import * as io from 'socket.io-client';
import { SeedMessage, DefaultSeedNamespace, TransportMessage, TransportMessageCallbackAsync, Transport, Connected } from '@transport';
import { ManualResetEvent, Action } from '@utils';

// Wraps socket.IO connection (client)
export class SocketIOClientTransport implements Transport {
    private connection: SocketIOClient.Socket;
    private connected: ManualResetEvent;

    start(): void {
        let connectAdress = (window as any).protocol + '//' + (window as any).host + ':80/' + DefaultSeedNamespace;
        this.connection = io(connectAdress);
    }   
    
    isStarted(): boolean {
        return !!this.connection;
    }
    
    onConnected(userCallback: (client: Connected) => void) {
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

    send(message: TransportMessage): void {
        this.connected.wait().then(() => {
            this.connection.emit(SeedMessage, message);
        });
    }
}