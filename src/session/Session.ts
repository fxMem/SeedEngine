import { User } from "@users";
import { ClientMessage, TargetBuilder } from "@transport";

export enum SessionState {
    waiting,
    running,
    finished
}

export interface SessionInfo {
    state: SessionState;

    description: string;
}

export interface Session {
    id(): string;

    players(): User[];

    onPlayerJoin(callback: (player: User) => Promise<void>): void;
    onPlayerLeave(callback: (player: User) => Promise<void>): void;
    onPlayerMessage(callback: (message: any, from: User) => Promise<void>): void;
    
    onStarted(callback: () => void): void;

    sendMessage(message: ClientMessage): TargetBuilder;
}