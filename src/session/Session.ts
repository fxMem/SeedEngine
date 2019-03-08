import { User } from "@users";
import { ClientMessage, TargetBuilder } from "@transport";
import { SessionInfo } from "./SessionInfo";

// This interface is used by server
export interface InternalSession {
    id(): string;

    getInfo(): SessionInfo;

    players(): User[];
}

// This interface is handed to game implementation
export interface Session {

    // Currently connected players
    players(): User[];

    // Allows game implemention to subscribe to game lifecycle events
    subscribe(subscriber: SessionEvents): void;

    // Sends message to client(s)
    sendMessage(message: ClientMessage): TargetBuilder;
}

export interface SessionEvents {

    // Invoked when player joins the session 
    playerJoin?: (player: User) => Promise<void>;

    // Invoked when player leaves
    playerLeave?: (player: User) => Promise<void>;

    // Invoked when message recieved from a player
    message?: (message: any, from: User) => Promise<void>;

    // Invoked when lobby logic determenies it's time to start. 
    // To get custom behaviour, implement own lobby logic instead of trying
    // to somehow ignore this event
    started?: () => void;
}