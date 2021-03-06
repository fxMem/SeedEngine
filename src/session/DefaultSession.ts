import { SessionHandler, Session, SessionEvents, GenericClientMessage } from "./Session";
import { EventEmitter } from "events";
import { SessionState, SessionInfo } from "./SessionInfo";
import { SessionStateChangedNotificationHeader, SessionStateChangedNotification } from "./SessionMessage";
import { ScopedLogger } from "../log/Logger";
import { User } from "../users/User";
import { GroupHandle, Group } from "../groups/Group";
import { MessageSender } from "../transport/MessageSender";
import { createLocalLogScope } from "../log/LoggerScopes";
import { ServerError, DeniedError } from "../transport/ServerError";
import { OperationResult, SuccessPromise } from "../core/OperationResult";
import { Claims } from "../users/Claims";
import { getUserInfoArray } from "../users/UserInfoArray";
import { getUserSessions } from "./UserSessions";

const playerJoined = 'playerJoined';
const playerLeft = 'playerLeft';
const messageRecieved = 'messageRecieved';
const started = 'started';

const legalSessionStateTransitions: { [key: string]: SessionState[] } = {
    [SessionState.waiting]: [SessionState.running, SessionState.finished],
    [SessionState.running]: [SessionState.halted, SessionState.finished],
    [SessionState.halted]: [SessionState.running, SessionState.finished],
    [SessionState.finished]: []
}

function canChangeSessionState(previousState: SessionState, nextState: SessionState): boolean {
    return legalSessionStateTransitions[previousState.toString()].some(s => s === nextState);
}

export interface DefaultSessionOptions {
    allowJoinAfterSessionStart: boolean;
}

export class DefaultSession extends EventEmitter implements SessionHandler, Session {

    private log: ScopedLogger;
    private state: SessionState;
    private startTime: Date;
    private connectedPlayers: User[] = [];
    private disposeCallback: () => void;
    private messageFromPlayerCallback: (message: any, from: User) => Promise<any> = async (m, f) => {};

    constructor(
        private localGroup: GroupHandle,
        private messageSender: MessageSender,
        private options: DefaultSessionOptions,
        private sessionId: string,
        private isPrivate: boolean,
        private description?: string) {

        super();

        this.state = SessionState.waiting;
        this.log = createLocalLogScope(
            `${'DefaultSession'} / ${this.sessionId} [${this.description || 'No description'}]`);
    }

    id() {
        return this.sessionId;
    }

    get private(): boolean {
        return this.isPrivate;
    }

    get info(): SessionInfo {
        return {
            id: this.sessionId,
            state: this.state,
            private: this.isPrivate,

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

    start(): void {

        this.moveToState(SessionState.running);
        this.startTime = new Date();
        this.emit(started);
    }

    halt(by: User, reason: string): void {
        throw new Error('Not implemented');
    }

    close() {
        this.moveToState(SessionState.finished);

        this.localGroup.close(`Session ${this.id} is finished!`);
        this.disposeCallback && this.disposeCallback();
    }

    setFinishedCallback(callback: () => void) {
        this.disposeCallback = callback;
    }

    subscribe(subscriber: SessionEvents): void {
        this.onPlayerJoin(subscriber.playerJoin);
        this.onPlayerLeave(subscriber.playerLeave);
        this.onStarted(subscriber.started);

        // We subscribe to this defferently because we need access to return value
        subscriber.message && (this.messageFromPlayerCallback = subscriber.message);
    }

    onPlayerJoin(callback: (player: User) => Promise<void>): void {
        callback && this.on(playerJoined, callback);
    }

    onPlayerLeave(callback: (player: User) => Promise<void>): void {
        callback && this.on(playerLeft, callback);
    }

    onStarted(callback: () => void): void {
        callback && this.on(started, callback);
    }

    sendMessage<T>(message: GenericClientMessage<T>): void {
        return this.messageSender.send(message).toGroups(this.localGroup).go();
    }

    private moveToState(nextState: SessionState, data?: any) {
        this.ensureTransitionAvailable(nextState);

        this.state = nextState;
        this.sendMessage<SessionStateChangedNotification>({
            header: SessionStateChangedNotificationHeader,
            payload: {
                sessionId: this.sessionId,
                nextState,
                data
            }
        });
    }

    private ensureTransitionAvailable(nextState: SessionState): void {
        if (!canChangeSessionState(this.state, nextState)) {
            throw new ServerError(`Cannot move session ${this} from state ${this.state} to ${nextState}`)
        }
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

        if (this.state !== SessionState.waiting && !this.options.allowJoinAfterSessionStart) {
            throw new ServerError(`User ${user} cannot join session ${this.sessionId} because it's already started and administrator prohibits to join running sessions.`);
        }

        this.connectedPlayers.push(user);
        this.localGroup.addUser(user);
        
        const userSessionData = getUserSessions(user);
        userSessionData.add(this.sessionId);

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

        const userSessionData = getUserSessions(user);
        userSessionData.remove(this.sessionId);
        
        this.log.info(`Player ${user} has left!`);
        this.emit(playerLeft, user);
    }

    async incomingMessage(message: any, from: User): Promise<any> {

        if (!this.getConnectedUser(from.nickname)) {
            throw new ServerError(`User ${from} cannot send messages to session ${this} because they are not joined!`);
        }
        
        this.log.info(`Message from ${from}, contents = ${JSON.stringify(message)}`);
        let result = await this.messageFromPlayerCallback(message, from);

        return result;
    }

    toString() {
        return `Session #${this.sessionId}`;
    }
}