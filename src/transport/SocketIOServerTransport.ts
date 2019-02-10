import * as socketIO from 'socket.io';
import { SeedMessage } from './Headers';
import { HttpFacade } from './HttpFacade';
import { Transport, TransportMessageCallbackAsync, TransportMessage, Connected } from './Transport';
import { Action } from '@utils';


// Wraps socket.IO connection (server)
export class SocketIOServerTransport implements Transport {
    private clientConnection: socketIO.Socket;
    private ioServer: socketIO.Server;

    constructor(private httpFacade: HttpFacade) {

    }

    start(): void {
        this.ioServer = socketIO(this.httpFacade);
    }

    isStarted() {
        return !!this.ioServer;
    }

    onConnected(userCallback: (client: Connected) => void) {
        this.ioServer.on('connection', (socketClient) => {
            userCallback({
                id: socketClient.id,
                onMessage: (callback) => {
                    socketClient.on(SeedMessage, callback);
                },
                onDisconnected: (callback) => {
                    socketClient.on('disconnect', callback);
                }
            });
        });
    }

    send(message: TransportMessage): void {
        this.clientConnection.emit(SeedMessage, message);
    }
}
