import { Session } from "./Session";
import { User, Claims } from "@users";
import { TargetBuilder, ClientMessage, ServerError } from "@transport";
import { EventEmitter } from "events";

const playerJoined = 'playerJoined';
const playerLeft = 'playerLeft';
const messageRecieved = 'messageRecieved';
const started = 'started';

export class DefaultSession extends EventEmitter implements Session {

    private connectedPlayers: User[] = [];

    constructor(private sessionId: string) {
        super();
    }

    id() {
        return this.sessionId;
    }

    players(): User[] {
        return this.connectedPlayers;
    }
    onPlayerJoin(callback: (player: User) => Promise<void>): void {
        this.on(playerJoined, callback);
    }
    onPlayerLeave(callback: (player: User) => Promise<void>): void {
        this.on(playerLeft, callback);
    }
    onPlayerMessage(callback: (message: any, from: User) => Promise<void>): void {
        this.on(messageRecieved, callback);
    }
    onStarted(callback: () => void): void {
        this.on(started, callback);
    }
    sendMessage(message: ClientMessage): TargetBuilder {
        throw new Error("Method not implemented.");
    }

    addPlayer(user: User): Promise<{ success: boolean, message?: string }> {

        if (!user.haveClaim(Claims.joinSession)) {
            throw new ServerError(`User ${user.nickname} can't join any sessions!`);
        }

        this.connectedPlayers.push(user);
        this.emit(playerJoined, user);

        return Promise.resolve({ success: true });
    }

    removePlayer(id: string): void {
        let leavingUser = this.connectedPlayers.filter(p => p.id === id);
        this.connectedPlayers = this.connectedPlayers.filter(p => p.id !== id);
        this.emit(playerLeft, leavingUser);
    }

    incomingMessage(message: any, from: User): void {
        this.emit(messageRecieved, message, from);
    }
}