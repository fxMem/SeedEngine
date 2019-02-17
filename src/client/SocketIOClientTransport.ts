import * as io from 'socket.io-client';

import { ManualResetEvent, Action } from '@utils';
import { DefaultSeedNamespace, SeedMessage } from '@transport/Headers';
import { Connected, TransportMessage, Transport } from '@transport/Transport';

// Wraps socket.IO connection (client)
export class SocketIOClientTransport implements Transport {
    private connection: SocketIOClient.Socket;
    private connected: ManualResetEvent;

    start(): void {
        this.connection = io.connect(`/${DefaultSeedNamespace}`);
    }   
    
    isStarted(): boolean {
        return !!this.connection;
    }
    
    onConnected(userCallback: (client: Connected) => void) {
        this.connection.on('connection', () => {
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