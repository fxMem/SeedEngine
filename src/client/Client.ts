import { Connection } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";

export class Client {
    private connection: Connection;

    
    constructor() {
        this.connection = new Connection(new SocketIOClientTransport());        
    }

    async authenticate(): Promise<void> {

    }
}