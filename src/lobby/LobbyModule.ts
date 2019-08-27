import { User } from "../users/User";
import { SessionHandler } from "../session/Session";
import { MessageSender } from "../transport/MessageSender";

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