import { User } from "@users";
import { ClientMessage, TargetBuilder } from "@transport";

export enum SessionState {
    waiting,
    running,
    finished
}

export interface SessionInfo {
    id: string;
    state: SessionState;

    playersCount: number;
    timePassed: Date;
    description: string;
}

export interface Session {
    id(): string;

    getInfo(): SessionInfo;

    players(): User[];

    onPlayerJoin(callback: (player: User) => Promise<void>): void;
    onPlayerLeave(callback: (player: User) => Promise<void>): void;
    onPlayerMessage(callback: (message: any, from: User) => Promise<void>): void;
    
    onStarted(callback: () => void): void;

    sendMessage(message: ClientMessage): TargetBuilder;
}