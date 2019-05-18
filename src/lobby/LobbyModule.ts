import { User } from "../users";
import { SessionHandler } from "../session";
import { MessageSender } from "../server";

export interface LobbyContext {
    message: any,
    from: User,
    session: SessionHandler,
    sender: MessageSender
}

export interface LobbyModule {
    

    isModuleCommand(message: any): boolean;

    handle(context: LobbyContext): Promise<any>;
}