import { Users, User } from "@users";
import { SessionHandler } from "@session";

export interface LobbyContext {
    message: any,
    from: User,
    session: SessionHandler
}

export interface LobbyModule {
    

    isModuleCommand(message: any): boolean;

    handle(context: LobbyContext): Promise<any>;
}