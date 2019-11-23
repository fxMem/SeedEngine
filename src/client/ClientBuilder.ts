import { ClientConnectionHandler } from "./ClientConnectionHandler";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export class ClientBuilder {

    private handler: ClientConnectionHandler;
    constructor() {
        this.handler = new ClientConnectionHandler();
    }

    addClientInterface<T, K extends keyof T>(client: T): this & T {
        for(let key in client) {
            let clientProvider = client[key];
            (clientProvider as any).handler = this.handler;

            (this as any)[key] = client[key];
        }

        return this as any;
    }
    
    onMessage(callback: (message) => {}): void {
        this.handler.onMessage(callback);
    }

    onConnectionError(callback: () => void) {
        this.handler.onConnectionError(callback);
    }

    async connect(): Promise<this> {
        
        await this.handler.connect();
        return this;
    }
}