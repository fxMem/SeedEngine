import { Connection, ConnectedClient } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { Header } from "@transport/Headers";

// Client interfaces must implement this along with
// any server-side methods they wish to expose to client
export interface Client {
    handler: ClientConnectionHandler;
}

export class ClientConnectionHandler {
    private connection: Connection;
    private client: ConnectedClient;
    private messageCallback: any = (message) => { };

    constructor() {
        this.connection = new Connection(new SocketIOClientTransport());
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.onConnected((connectedClient) => {
                this.client = connectedClient;

                connectedClient.onMessage((message) => {
                    return this.messageCallback(message);
                });

                resolve();
            });

            this.connection.start();
        });
    }

    onMessage(callback: (message) => {}): void {
        this.messageCallback = callback;
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
            throw new Error(result.message);
        }

        return result;
    }
}