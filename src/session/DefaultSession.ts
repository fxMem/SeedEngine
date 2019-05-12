import { SessionHandler, Session, SessionEvents } from "./Session";
import { EventEmitter } from "events";
import { ScopedLogger, createLocalLogScope } from "../log";
import { User, Claims } from "../users";
import { GroupHandle, Group } from "../groups";
import { MessageSender, ClientMessage, TargetBuilder, ServerError, DeniedError } from "../server";
import { SessionState, SessionInfo } from "./SessionInfo";
import { OperationResult, SuccessPromise } from "../core";

const playerJoined = 'playerJoined';
const playerLeft = 'playerLeft';
const messageRecieved = 'messageRecieved';
const started = 'started';

export class DefaultSession extends EventEmitter implements SessionHandler, Session {

    private log: ScopedLogger;
    private state: SessionState;
    private startTime: Date;
    private connectedPlayers: User[] = [];
    private disposeCallback: () => void;

    constructor(
        private localGroup: GroupHandle,
        private messageSender: MessageSender,
        private sessionId: string,
        private description?: string) {

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

    group(): Group {
        return this.localGroup;
    }

    close() {
        this.state = SessionState.finished;
        this.localGroup.close(`Session ${this.id} is finished!`);
        this.disposeCallback && this.disposeCallback();
    }

    setFinishedCallback(callback: () => void) {
        this.disposeCallback = callback;
    }

    subscribe(subscriber: SessionEvents): void {
        this.onPlayerJoin(subscriber.playerJoin);
        this.onPlayerLeave(subscriber.playerLeave);
        this.onPlayerMessage(subscriber.message);
        this.onStarted(subscriber.started);
    }

    onPlayerJoin(callback: (player: User) => Promise<void>): void {
        callback && this.on(playerJoined, callback);
    }

    onPlayerLeave(callback: (player: User) => Promise<void>): void {
        callback && this.on(playerLeft, callback);
    }

    onPlayerMessage(callback: (message: any, from: User) => Promise<void>): void {
        callback && this.on(messageRecieved, callback);
    }

    onStarted(callback: () => void): void {
        callback && this.on(started, callback);
    }

    sendMessage(message: ClientMessage): TargetBuilder {
        return this.messageSender.send(message);
    }

    start(): void {
        this.state = SessionState.running;
        this.startTime = new Date();
        this.emit(started);
    }

    private getConnectedUser(nickname: string): User {
        return this.connectedPlayers.filter(p => p.nickname === nickname)[0];
    }
    addPlayer(user: User): Promise<OperationResult> {

        if (!user.haveClaim(Claims.joinSession)) {
            throw new DeniedError(`User ${user.nickname} can't join any sessions!`);
        }

        if (this.getConnectedUser(user.nickname)) {
            throw new ServerError(`User ${user} cannot join session ${this.sessionId} twice!`);
        }

        this.connectedPlayers.push(user);
        this.localGroup.addUser(user);

        this.emit(playerJoined, user);
        this.log.info(`Player ${user} joined!`);
        return SuccessPromise;
    }

    removePlayer(user: User): void {
        if (!this.getConnectedUser(user.nickname)) {
            this.log.info(`Player ${user} is leaving session ${this} but he wasn't here in the first place!`);
            return;
        }

        this.connectedPlayers = this.connectedPlayers.filter(p => p.nickname !== user.nickname);
        this.localGroup.removeUser(user);

        this.log.info(`Player ${user} has left!`);
        this.emit(playerLeft, user);
    }

    incomingMessage(message: any, from: User): void {

        this.log.info(`Message from ${from}, contents = ${JSON.stringify(message)}`);
        this.emit(messageRecieved, message, from);
    }

    toString() {
        return `Session #${this.sessionId}`;
    }
}