import { MessageSender } from './MessageSender';
import { Connected, Transport } from './Transport';

// Adds RPC logic (MessageSender) on top of transport connection
export class Connection {

    private sender: MessageSender;
    private userCallback: (client: Connected) => void;

    constructor(private transport: Transport) {
        this.sender = new MessageSender(this.transport.send.bind(this));
    }

    start(options?: { port?: number }) {
        this.transport.start();
        this.userCallback && this.onConnected(this.userCallback);
    }

    onConnected(userCallback: (client: Connected) => void) {
        if (!this.transport.isStarted()) {
            this.userCallback = userCallback;
            return;
        }

        this.transport.onConnected((transportClient) => {
            userCallback({
                id: transportClient.id,
                onMessage: (userCallback) => transportClient.onMessage(this.sender.enableRPC(userCallback)),
                onDisconnected: transportClient.onDisconnected
            })
        });
    }

    send(header: string, payload: any): void {
        this.sender.send(header, payload);
    }

    invoke(header: string, payload: any): Promise<any> {
        return this.sender.sendAndGetResult(header, payload);
    }
}