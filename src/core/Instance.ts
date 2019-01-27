import { Server } from "@transport";

export interface InstanceOptions {
    rootUser: string;
}

export interface Instance {
    start(): void;

    stop(): void;
}

export class DefaultInstance implements Instance {
    
    constructor(private server: Server) {
        
    }

    start(): void {
        throw new Error("Method not implemented.");
    }
    stop(): void {
        throw new Error("Method not implemented.");
    }
}
