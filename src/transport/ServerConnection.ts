import * as socketIO from 'socket.io';
import { SeedMessage } from './Headers';
import { HttpFacade } from './HttpFacade';
import { MessageSender, TransportMessageCallbackAsync, TransportMessage } from './MessageSender';
import { Action } from '@utils';

export type ConnectedClient = {
    id: string;
    onMessage: (callback: TransportMessageCallbackAsync) => void;
    onDisconnected: (callback: Action) => void;
}

// Wraps socket.IO connection
export class ServerConnection {
    private clientConnection: socketIO.Socket;
    private ioServer: socketIO.Server;
    private sender: MessageSender;

    constructor(private httpFacade: HttpFacade) {
        this.ioServer = socketIO(this.httpFacade);
        this.sender = new MessageSender(this.sendToSocket.bind(this));
    }

    onConnected(userCallback: (client: ConnectedClient) => void) {
        let messageCallback: TransportMessageCallbackAsync;
        let disconnectedCallback: Action;

        this.ioServer.on('connection', (socketClient) => {
            userCallback({
                id: socketClient.id,
                onMessage: (callback) => {
                    messageCallback = callback;
                },
                onDisconnected: (callback) => {
                    disconnectedCallback = callback;
                }
            });

            socketClient.on(SeedMessage, this.sender.enableRPC(messageCallback));

            socketClient.on('disconnect', () => {
                disconnectedCallback();
            });
        });
    }

    send(header: string, payload: any) {
        this.sender.send(header, payload);
    }

    invoke(header: string, payload: any): Promise<any> {
        return this.sender.sendAndGetResult(header, payload);
    }

    private sendToSocket(message: TransportMessage): void {
        this.clientConnection.emit(SeedMessage, message);
    }
}
