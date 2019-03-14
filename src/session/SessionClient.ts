import { SessionCommand, SessionMessage } from "./SessionMessage";
import { SessionInfo } from "./SessionInfo";
import { ClientConnectionHandler, Client } from "@client";
import { OperationResult } from "@core/OperationResult";



export interface SessionClient extends Client {
    createSession(sessionDescription?: string, join?: boolean): Promise<{
        sessionId: string,
        joined?: OperationResult
    }>;

    joinSession(sessionId: string): Promise<OperationResult>;

    leaveSession(sessionId: string): Promise<void>;

    allSessions(): Promise<SessionInfo[]>;
}

export class DefaultSessionClient implements SessionClient {
    handler: ClientConnectionHandler;

    createSession(sessionDescription?: string, join?: boolean): Promise<{ 
        sessionId: string; joined?: OperationResult; 
    }> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.create,
            sessionDescription,
            join
        });
    }    

    joinSession(sessionId: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.join,
            sessionId: sessionId
        });
    }

    leaveSession(sessionId: string): Promise<void> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.leave,
            sessionId: sessionId
        });
    }

    allSessions(): Promise<SessionInfo[]> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.getList
        });
    }
}