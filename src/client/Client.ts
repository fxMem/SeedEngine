import { Connection } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { ConnectedCallback } from "@transport";

export class Client {
    private connection: Connection;

    
    constructor() {
        this.connection = new Connection(new SocketIOClientTransport());        
    }

    connect(callback: ConnectedCallback) {
        this.connection.onConnected(callback);
        this.connection.start();
    }

    async authenticate(): Promise<void> {

    }
}