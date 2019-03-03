import { Message, MessageContext, ServerError, SpecificMessageTypeHandler } from "@transport";
import { User } from "@users";
import { DefaultSessionManager } from "./DefaultSessionManager";
import { DefaultSession } from "./DefaultSession";
import { SessionCommand } from "./SessionCommand";
import { SessionInfo } from "./SessionInfo";

interface SessionSelectionOptions {
    sessionId?: string;
}

interface SessionCreationOptions {
    sessionDescription: string;
}

export interface SessionMessage extends Message, SessionSelectionOptions, SessionCreationOptions {
    command: SessionCommand;
    
}

function isSessionMessage(message: Message): message is SessionMessage {
    return (message as any).command;
}

export class SessionPipeline implements SpecificMessageTypeHandler {

    constructor(private sessionManager: DefaultSessionManager) {

    }

    canHandle(message: Message): boolean {
        return isSessionMessage(message);
    }

    handle(context: MessageContext): Promise<any> {
        let { message, from } = context;

        if (!isSessionMessage(message)) {
            throw new ServerError('Incorrect message type for SessionPipeline!');
        }

        let { command } = message;
        let result: any;
        switch (command) {
            case SessionCommand.getList:
                result = this.getList(from);
                break;
            case SessionCommand.create:
                result = this.createSession(message, from);
                break;
            case SessionCommand.join:
                result = this.joinSession(message.sessionId, from);
                break;
            case SessionCommand.leave:
                result = this.leaveSession(from);
                break;
            default:
                throw new ServerError(`Unknown session command: ${command}`);
        }

        return Promise.resolve(result);
    }

    private createSession(message: SessionMessage, creator: User): { sessionId: string } {

        let session = this.sessionManager.createSession({
            owner: creator,
            description: message.sessionDescription
        });

        return {
            sessionId: session.id()
        };
    }

    private getList(user: User): SessionInfo[] {
        return this.sessionManager.listAllSessions();
    }

    private async joinSession(sessionId: string, applicant: User): Promise<any> {

        let session = this.getSession(sessionId);
        let result = await session.addPlayer(applicant);
        applicant.data.sessionId = sessionId;

        return result;
    }

    private leaveSession(applicant: User): any {
        let sessionId = applicant.data.sessionId;
        if (!sessionId) {
            throw new ServerError(`User ${applicant.nickname} hasn't joined any session!`);
        }

        let session = this.getSession(sessionId);
        session.removePlayer(applicant.id);
    }

    private getSession(sessionId: string): DefaultSession {
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