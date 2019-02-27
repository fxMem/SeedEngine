import { Connection, ClientConnectedCallback, ConnectedClient } from "@transport/Connection";
import { SocketIOClientTransport } from "./SocketIOClientTransport";
import { Header } from "@transport/Headers";

export type ServerApi = {
    getAvailableAuthMethods: () => Promise<{ id: string, description: string }[]>;
    authenticate: (moduleId: string, data: any) => Promise<boolean>;
}
export type Connect = ConnectedClient & ServerApi;

export class Client {
    private connection: Connection;

    constructor() {
        this.connection = new Connection(new SocketIOClientTransport());
    }

    connect(callback: (connect: Connect) => Promise<void>) {
        this.connection.onConnected((connectedClient) => {
            let connect: Connect = { 
                ...connectedClient,
                getAvailableAuthMethods: () => connectedClient.invoke({
                    header: Header.Authenticate, 
                    payload: null
                }),
                authenticate: (moduleId, data) => connectedClient.invoke({
                    header: Header.Authenticate, 
                    payload: { moduleId, ...data }
                })
            };

            callback(connect);
        });

        this.connection.start();
    }
}