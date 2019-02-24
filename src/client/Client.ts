import { Connection } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { Header } from "@transport/Headers";
import { ConnectedCallback } from "@transport/Transport";

export class Client {
    private connection: Connection;


    constructor() {
        this.connection = new Connection(new SocketIOClientTransport());
    }

    connect(callback: ConnectedCallback) {
        this.connection.onConnected(callback);
        this.connection.start();
    }

    async getAvailableAuthMethods(): Promise<{ id: string, description: string }[]> {
        return await this.connection.invoke(Header.Authenticate, null);
    }

    async authenticate(methodId: string, data: any): Promise<boolean> {
        return await this.connection.invoke(Header.Authenticate, data);
    }
}