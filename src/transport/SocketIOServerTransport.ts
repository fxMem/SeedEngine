import * as socketIO from 'socket.io';
import { SeedMessage, DefaultSeedNamespace } from './Headers';
import { HttpFacade } from './HttpFacade';
import { Transport, TransportMessageCallbackAsync, TransportMessage, Connected } from './Transport';
import { Action } from '@utils';


// Wraps socket.IO connection (server)
export class SocketIOServerTransport implements Transport {
    private clientConnection: socketIO.Socket;
    private ioServer: socketIO.Namespace;

    constructor(private httpFacade: HttpFacade) {

    }

    start(options: any): void {
        this.ioServer = socketIO(this.httpFacade).of(`/${DefaultSeedNamespace}`);
        this.httpFacade.listen(options && options.port || 80, (e) => { });
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
