import { Message, MessageContext, ServerError, SpecificMessageTypeHandler } from "@transport";
import { User } from "@users";
import { SessionInfo } from "./SessionInfo";
import { SessionHandler } from "./Session";
import { SessionManager } from "@session";
import { SessionMessage, SessionCommand, isSessionMessage } from "./SessionMessage";
import { OperationResult } from "@core";

export class SessionPipeline implements SpecificMessageTypeHandler {

    name: 'sessionHandler';
    constructor(private sessionManager: SessionManager) {

    }

    canHandle(message: Message): boolean {
        return isSessionMessage(message);
    }

    async handle(context: MessageContext): Promise<any> {
        let { message, from } = context;

        if (!isSessionMessage(message)) {
            throw new ServerError('Incorrect message type for SessionPipeline!');
        }

        let { sessionCommand: command } = message;
        let result: any;
        switch (command) {
            case SessionCommand.getList:
                result = this.getList(from);
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
            default:
                throw new ServerError(`Unknown session command: ${command}`);
        }

        return result;
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

    private joinSessionBySessionId(sessionId: string, applicant: User): Promise<any> {

        let session = this.getSession(sessionId);
        return this.joinSession(session, applicant);
    }

    private async joinSession(session: SessionHandler, applicant: User): Promise<OperationResult> {

        let result = await session.addPlayer(applicant);
        return result;
    }

    // The reasoning behind this is that player actually might join several sessions,
    // so we should know which one he leaves, hence sessionId parameter
    private leaveSession(sessionId: string, applicant: User): any {

        let session = this.getSession(sessionId);
        session.removePlayer(applicant.id);
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