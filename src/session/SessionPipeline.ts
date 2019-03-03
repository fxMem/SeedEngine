import { SpecificMessageTypeHandler, Message, MessageContext } from "@transport";
import { SessionManager } from "./SessionManager";
import { User } from "@users";
import { Claims } from "users/Claims";
import { ServerError } from "@transport/ServerError";
import { DefaultSessionManager } from "./DefaultSessionManager";
import { DefaultSession } from "./DefaultSession";

export enum SessionCommand {
    create,
    join,
    leave
}

export interface SessionMessage extends Message {
    command: SessionCommand;

    sessionId?: string;
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
        switch (command) {
            case SessionCommand.create:
                return this.createSession(message, from);
            case SessionCommand.join:
                return this.joinSession(message.sessionId, from);
            case SessionCommand.leave:
                return this.leaveSession(from);
            default:
                throw new ServerError(`Unknown session command: ${command}`);
        }
    }

    private createSession(message: SessionMessage, creator: User): any {

        let session = this.sessionManager.createSession({
            owner: creator
        });

        return {
            sessionId: session.id()
        };
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
            return new ServerError(`User ${applicant.nickname} hasn't joined any session!`);
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