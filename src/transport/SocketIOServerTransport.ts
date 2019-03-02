import * as socketIO from 'socket.io';
import { SeedMessage, DefaultSeedNamespace } from './Headers';
import { HttpFacade } from './HttpFacade';
import { Transport, TransportMessageCallbackAsync, TransportMessage, TransportClient } from './Transport';
import { Action } from '@utils';


// Wraps socket.IO connection (server)
export class SocketIOServerTransport implements Transport {
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

    send(message: TransportMessage, options: { broadcast?: boolean, targets: string[] }): void {
        let target = this.ioServer;

        if (options.targets) {
            for (let clientId of options.targets) {
                target = target.to(clientId);
            }
        }
        
        target.emit(SeedMessage, message);
    }

    onConnected(userCallback: (client: TransportClient) => void) {
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
}
