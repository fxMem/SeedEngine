import { SessionHandler } from "./Session";
import { User, Claims } from "@users";
import { TargetBuilder, ClientMessage, ServerError, MessageSender } from "@transport";
import { EventEmitter } from "events";
import { SessionState, SessionInfo } from "./SessionInfo";
import { createLocalLogScope, ScopedLogger } from "@log";
import { SessionJoiningResult } from "./SessionMessage";

const playerJoined = 'playerJoined';
const playerLeft = 'playerLeft';
const messageRecieved = 'messageRecieved';
const started = 'started';

export class DefaultSession extends EventEmitter implements SessionHandler {

    private log: ScopedLogger;
    private state: SessionState;
    private startTime: Date;
    private connectedPlayers: User[] = [];

    constructor(private messageSender: MessageSender, private sessionId: string, private description?: string) {
        super();

        this.state = SessionState.waiting;
        this.log = createLocalLogScope(
            `${nameof(DefaultSession)} / ${this.sessionId} [${this.description || 'No description'}]`);
    }

    id() {
        return this.sessionId;
    }

    getInfo(): SessionInfo {
        return {
            id: this.sessionId,
            state: this.state,

            playersCount: this.connectedPlayers.length,
            timePassed: this.startTime,
            description: this.description || 'Just a regular gaming session'
        }
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

        this.state = SessionState.running;
        this.startTime = new Date();
        this.on(started, callback);
    }

    sendMessage(message: ClientMessage): TargetBuilder {
        return this.messageSender.send(message);
    }

    start(): void {
        this.emit(started);
    }

    addPlayer(user: User): Promise<SessionJoiningResult> {

        if (!user.haveClaim(Claims.joinSession)) {
            throw new ServerError(`User ${user.nickname} can't join any sessions!`);
        }

        this.connectedPlayers.push(user);
        this.emit(playerJoined, user);

        this.log.info(`Player ${user} joined!`);
        return Promise.resolve({ success: true });
    }

    removePlayer(id: string): void {
        let leavingUser = this.connectedPlayers.filter(p => p.id === id);
        this.connectedPlayers = this.connectedPlayers.filter(p => p.id !== id);

        this.log.info(`Player ${leavingUser} has left!`);
        this.emit(playerLeft, leavingUser);
    }

    incomingMessage(message: any, from: User): void {

        this.log.info(`Message from ${from}, contents = ${JSON.stringify(message)}`);
        this.emit(messageRecieved, message, from);
    }
}