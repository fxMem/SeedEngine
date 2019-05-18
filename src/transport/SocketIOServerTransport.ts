import * as socketIO from 'socket.io';
import { SeedMessage, DefaultSeedNamespace } from './Headers';
import { HttpFacade } from './HttpFacade';
import { Transport, TransportMessage, TransportClient } from './Transport';
import { MessageTarget } from './MessageTarget';
import { ServerError } from '../server';

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

    send(message: TransportMessage, options: { broadcast?: boolean, targets: MessageTarget[] }): void {
        let target = this.ioServer;
        let targetsAdded = false;
        if (options.targets) {
            for (let clientTarget of options.targets) {
                for (const targetId of clientTarget.targets) {
                    target = target.to(targetId);
                    targetsAdded = true;
                }
            }
        }

        if (!targetsAdded && !options.broadcast) {
            throw new ServerError(`Cannot send message ${JSON.stringify(message)} because target-list is empty but message is not broadcast!`);
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
