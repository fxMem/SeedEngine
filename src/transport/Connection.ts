import { RpcWrapper } from './RpcWrapper';
import { Transport } from './Transport';
import { Action } from '@utils';

export type ClientCallback = (message: ClientMessage) => Promise<any>;
export type ClientMessage = {
    header: string,
    payload: any,
};

export type ConnectedClient = {
    id: string;
    onMessage: (callback: ClientCallback) => void;
    onDisconnected: (callback: Action) => void;

    //send: (message: ClientMessage) => void;
    invoke: (message: ClientMessage) => Promise<any>;
}

export type ClientConnectedCallback = (client: ConnectedClient) => void;

// Adds RPC logic (MessageSender) on top of transport connection
export class Connection {

    private userCallback: (client: ConnectedClient) => void;

    constructor(private transport: Transport) {

    }

    start(options?: { port?: number }) {
        this.transport.start(options);
        this.userCallback && this.onConnected(this.userCallback);
    }

    onConnected(userCallback: ClientConnectedCallback) {
        if (!this.transport.isStarted()) {
            this.userCallback = userCallback;
            return;
        }

        this.transport.onConnected((transportClient) => {
            let sender = new RpcWrapper((message) => this.transport.send(message, { targets: [transportClient.id] }));

            userCallback({
                id: transportClient.id,
                onMessage: (userCallback) => transportClient.onMessage(sender.enableRPC(userCallback)),
                onDisconnected: transportClient.onDisconnected,
                //send: (message) => sender.send(message.header, message.payload),
                invoke: (message) => sender.sendAndGetResult(message.header, message.payload)
            })
        });
    }
}