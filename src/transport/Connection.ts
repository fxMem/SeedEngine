import { RpcWrapper } from './RpcWrapper';
import { Transport } from './Transport';
import { MessageTarget } from './MessageTarget';
import { Action } from '../utils/DelegateTypes';

export type ClientCallback = (message: ClientMessage) => Promise<any>;
export type ClientMessage = {
    header: string,
    payload: any,
};

export type ConnectedClient = {
    id: string;
    onMessage: (callback: ClientCallback) => void;
    onDisconnected: (callback: Action) => void;

    invoke: (message: ClientMessage) => Promise<any>;
}

export type ClientConnectedCallback = (client: ConnectedClient) => void;

// Adds RPC logic (MessageSender) on top of transport connection
export class Connection {

    constructor(private transport: Transport) {

    }

    start(options?: { port?: number }) {
        this.transport.start(options);
    }

    onConnected(userCallback: ClientConnectedCallback) {
        this.transport.onConnected((transportClient) => {
            let sender = new RpcWrapper((message) => this.transport.send(message, { targets: [new MessageTarget([transportClient.id])] }));

            userCallback({
                id: transportClient.id,
                onMessage: (userCallback) => transportClient.onMessage(sender.enableRPC(userCallback)),
                onDisconnected: transportClient.onDisconnected,
                invoke: (message) => sender.sendAndGetResult(message.header, message.payload)
            })
        });
    }
}