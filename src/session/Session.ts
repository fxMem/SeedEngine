import { SessionInfo } from "./SessionInfo";
import { User } from "../users";
import { OperationResult } from "../core";
import { Group } from "../groups";
import { ClientMessage, TargetBuilder } from "../server";

export type GenericClientMessage<T> = {
    header: string,
    payload: T
}

// This interface is used by server
export interface SessionHandler {
    id(): string;

    getInfo(): SessionInfo;

    players(): User[];

    group(): Group;

    addPlayer(user: User): Promise<OperationResult>;

    removePlayer(user: User): void;

    halt(by: User, reason: string): void;

    start(): void;

    sendMessage<T>(message: GenericClientMessage<T>): void;

    incomingMessage(message: any, from: User): Promise<any>;
}

// This interface is handed to game implementation
export interface Session {

    // Currently connected players
    players(): User[];

    // Group object for the session, this group contains all users connected to the session
    group(): Group;

    // Allows game implemention to subscribe to game lifecycle events
    subscribe(subscriber: SessionEvents): void;

    // Sends message to session client(s)
    sendMessage(message: ClientMessage): void;

    // Temporary halt session
    halt(by: User, reason: string): void;

    // Marks session as finished
    close(): void;
}

export interface SessionEvents {

    // Invoked when player joins the session 
    playerJoin?: (player: User) => Promise<void>;

    // Invoked when player leaves
    playerLeave?: (player: User) => Promise<void>;

    // Invoked when message recieved from a player
    message?: (message: any, from: User) => Promise<any>;

    // Invoked when lobby logic determenies it's time to start. 
    // To get custom behaviour, implement own lobby logic instead of trying
    // to somehow ignore this event
    started?: () => void;
}