import { isSessionMessage, SessionCommand, SessionMessage } from "./SessionMessage";
import { SessionInfo } from "./SessionInfo";
import { UserDisconnectedContext } from "../transport/UserDisconnectedContext";
import { getUserInfoArray } from "../users/UserInfoArray";
import { SpecificMessageTypeHandler } from "../transport/SpecificMessageTypeHandler";
import { SessionManager } from "./SessionManager";
import { MessageContext } from "../transport/MessagePipeline";
import { ServerError } from "../transport/ServerError";
import { User } from "../users/User";
import { OperationResult } from "../core/OperationResult";
import { SessionHandler } from "./Session";
import { getUserSessions } from "./UserSessions";


export class SessionPipeline implements SpecificMessageTypeHandler {

    name = 'sessionHandler';
    constructor(private sessionManager: SessionManager) {
        
    }

    canHandle(context: MessageContext): boolean {
        return context instanceof UserDisconnectedContext || isSessionMessage(context.message);
    }

    async handle(context: MessageContext): Promise<any> {
        let { message, from } = context;

        if (context instanceof UserDisconnectedContext) {
            this.leaveAllSessions(context.from);
            return;
        }

        if (!isSessionMessage(message)) {
            throw new ServerError('Incorrect message type for SessionPipeline!');
        }

        let { sessionCommand: command } = message;
        let result: any;
        switch (command) {
            case SessionCommand.getList:
                result = this.getList(from);
                break;
            case SessionCommand.getOne:
                result = this.getOne(message.sessionId);
                break;
            case SessionCommand.create:
                result = await this.createSession(message, from);
                break;
            case SessionCommand.join:
                result = await this.joinSessionBySessionId(message.sessionId, from);
                break;
            case SessionCommand.leave:
                result = this.leaveSession(message.sessionId, from);
                break;
            case SessionCommand.message:
                result = await this.passSessionMessage(message.sessionId, from, message.payload);
                break;
            default:
                throw new ServerError(`Unknown session command: ${command}`);
        }

        return result;
    }

    private passSessionMessage(sessionId: string, from: User, payload: any): Promise<any> {

        let session = this.getSession(sessionId);
        return session.incomingMessage(payload, from);
    }

    private async createSession(message: SessionMessage, creator: User): Promise<{ sessionId: string, joined?: OperationResult }> {

        let session = this.sessionManager.createSession({
            owner: creator,
            description: message.sessionDescription
        });

        let joiningResult = message.join ? await this.joinSession(session, creator) : null;

        return {
            sessionId: session.id(),
            joined: joiningResult
        };
    }

    private getList(user: User): SessionInfo[] {
        return this.sessionManager.listAllSessions(user);
    }

    private getOne(sessionId: string): SessionInfo {
        return this.getSession(sessionId).info;
    }

    private joinSessionBySessionId(sessionId: string, applicant: User): Promise<any> {

        const session = this.getSession(sessionId);
        if (session.info.private) {
            throw new ServerError(`Cannot join ${session} cause it's private!`);
        }

        return this.joinSession(session, applicant);
    }

    private async joinSession(session: SessionHandler, applicant: User): Promise<OperationResult> {
        return await session.addPlayer(applicant);
    }

    private leaveAllSessions(applicant: User) {

        const userSessionData = getUserSessions(applicant);
        for (const sessionId of userSessionData.values) {
            this.leaveSession(sessionId, applicant);
        }
    }

    // The reasoning behind this is that player actually might join several sessions,
    // so we should know which one he leaves, hence sessionId parameter
    private leaveSession(sessionId: string, applicant: User): any {

        const session = this.getSession(sessionId);
        session.removePlayer(applicant);
    }

    private getSession(sessionId: string): SessionHandler {
        if (!sessionId) {
            throw new ServerError('Session id is not specified!');
        }

        let session = this.sessionManager.getSession(sessionId);
        if (!session) {
            throw new ServerError(`Session with id ${sessionId} is not found!`);
        }

        return session;
    }
}