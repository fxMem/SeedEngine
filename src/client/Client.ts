import { Connection, ClientConnectedCallback, ConnectedClient } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { Header } from "@transport/Headers";
import { SessionCommand } from "session/SessionPipeline";

export type ServerApi = {
    getAvailableAuthMethods: () => Promise<{ id: string, description: string }[]>;
    authenticate: (moduleId: string, data: any) => Promise<boolean>;
}
export type Connect = ConnectedClient & ServerApi;

export class Client {
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

    createSession(): Promise<{ sessionId: string }> {
        return this.invokeWithMessage({
            command: SessionCommand.create
        });
    }

    joinSession() {
        
    }

    authenticate(moduleId: string, data: any): Promise<any> {
        return this.client.invoke({
            header: Header.Authenticate,
            payload: { moduleId, ...data }
        })
    }

    getAvailableAuthMethods(): Promise<any> {
        return this.client.invoke({
            header: Header.Authenticate,
            payload: null
        })
    }

    private async invokeWithMessage(payload: any): Promise<any> {
        let result = await this.client.invoke({
            header: Header.Message,
            payload
        });

        if (result.failed) {
            throw new Error(result.message);
        }

        return result;
    }
}