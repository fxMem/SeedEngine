import { ClientConnectionHandler, Client } from "../client";
import { Header } from "../transport/Headers";


export interface AuthClient extends Client {
    getAvailableAuthMethods(): Promise<{ id: string, description: string }[]>;
    authenticate(moduleId: string, data: any): Promise<boolean>;
}

export class DefaultAuthClient implements AuthClient {
    handler: ClientConnectionHandler;

    getAvailableAuthMethods(): Promise<{ id: string; description: string; }[]> {
        return this.handler.invoke({
            header: Header.Authenticate,
            payload: null
        })
    }    
    
    authenticate(moduleId: string, data: any): Promise<boolean> {
        return this.handler.invoke({
            header: Header.Authenticate,
            payload: { moduleId, ...data }
        })
    }
}