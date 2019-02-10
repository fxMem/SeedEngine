import * as io from 'socket.io-client';
import { SeedMessage, DefaultSeedNamespace, TransportMessage, MessageSender, TransportMessageCallbackAsync } from '@transport';
import { ManualResetEvent, Action } from '@utils';

export type ConnectedServer = {
    onMessage: (callback: TransportMessageCallbackAsync) => void;
    onDisconnected: (callback: Action) => void;
}

export class ClientConnection {
    private connection: SocketIOClient.Socket;
    private connected: ManualResetEvent;
    private sender: MessageSender;

    constructor() {
        this.sender = new MessageSender(this.sendInternal.bind(this));
    }

    connect(userCallback: (server: ConnectedServer) => void): void {
        let onMessageCallback: TransportMessageCallbackAsync;
        let onDisconnectedCallback: Action;

        let connectAdress = (window as any).protocol + '//' + (window as any).host + ':80/' + DefaultSeedNamespace;
        this.connection = io(connectAdress);
        this.connection.on('connect', () => {
            this.connected.set();

            userCallback({
                onMessage: (callback) => {
                    onMessageCallback = callback;
                },
                onDisconnected: (callback) => {
                    onDisconnectedCallback = callback;
                }
            });

            this.connection.on(SeedMessage, this.sender.enableRPC(onMessageCallback));
            this.connection.on('disconnect', onDisconnectedCallback);
        });
    }

    public send(header: string, payload: any): void {
        this.sender.send(header, payload);
    }

    public invoke(header: string, payload: any): Promise<any> {
        return this.sender.sendAndGetResult(header, payload);
    }

    private async sendInternal(message: TransportMessage): Promise<void> {
        await this.connected.wait();
        this.connection.emit(SeedMessage, message);
    }
}
