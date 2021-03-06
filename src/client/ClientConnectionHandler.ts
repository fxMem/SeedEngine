
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { Connection, ConnectedClient } from "../transport/Connection";
import { Header } from "../transport/Headers";
import { ServerError } from "../transport/ServerError";

// Client interfaces must implement this along with
// any server-side methods they wish to expose to client
export interface Client {
    handler: ClientConnectionHandler;
}

export class ClientConnectionHandler {
    private transport: SocketIOClientTransport;
    private connection: Connection;
    private client: ConnectedClient;
    private messageCallback: any = () => { };
    private errorCallback = () => { };
    private callbacks = new Map<string, any>();

    constructor() {
        this.transport = new SocketIOClientTransport();
        this.connection = new Connection(this.transport);
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.start();

            this.connection.onConnected((connectedClient) => {
                this.client = connectedClient;

                connectedClient.onMessage((message) => {
                    let callbackForHeader = this.callbacks.get(message.header);
                    if (callbackForHeader) {
                        return callbackForHeader(message.payload);
                    }
                    else {
                        return this.messageCallback(message);
                    }
                });

                resolve();
            });

            this.transport.onConnectionError(this.errorCallback);
        });
    }

    onConnectionError(callback: () => void) {
        this.errorCallback = callback;
    }

    onMessage(callback: (message) => {}): void {
        this.messageCallback = callback;
    }

    subscribeToTitledMessage(header: string, callback: any): void {
        this.callbacks.set(header, callback);
    }

    invokeWithMessage<T>(payload: T): Promise<any> {
        return this.invoke({
            header: Header.Message,
            payload
        });
    }

    async invoke(message: any): Promise<any> {
        let result = await this.client.invoke(message);

        if (result.failed) {
            throw new ServerError(result.message, result.errorCode);
        }

        return result;
    }
}