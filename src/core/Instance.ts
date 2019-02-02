import { Server } from "@transport";

export interface InstanceOptions {
    port?: number
}

export interface Instance {
    start(): void;
}

export class DefaultInstance implements Instance {
    
    constructor(private options: InstanceOptions, private server: Server) {
        
    }

    start(): Promise<boolean> {
        return this.server.listen(this.options.port);
    }
}
