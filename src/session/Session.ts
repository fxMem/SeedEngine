import { User } from "@users";
import { ClientMessage, TargetBuilder } from "@transport";
import { SessionInfo } from "./SessionInfo";

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