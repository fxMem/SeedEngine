import { SessionCommand, SessionMessage, SessionStateChangedNotificationHeader, SessionStateChangedNotification } from "./SessionMessage";
import { SessionInfo } from "./SessionInfo";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { OperationResult } from "../core/OperationResult";

export interface SessionClient extends Client {
    createSession(isPrivate: boolean, sessionDescription?: string, join?: boolean): Promise<{
        sessionId: string,
        joined?: OperationResult
    }>;

    joinSession(sessionId: string): Promise<OperationResult>;

    leaveSession(sessionId: string): Promise<void>;

    allSessions(): Promise<SessionInfo[]>;
}

export class DefaultSessionClient implements SessionClient {
    handler: ClientConnectionHandler;

    createSession(isPrivate: boolean, sessionDescription?: string, join?: boolean): Promise<{ 
        sessionId: string; joined?: OperationResult; 
    }> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.create,
            isPrivate,
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

    getSingleSessionInfo(sessionId: string): Promise<SessionInfo> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.getOne,
            sessionId: sessionId
        });
    }

    allSessions(): Promise<SessionInfo[]> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.getList
        });
    }

    sendMessage(sessionId: string, payload: any): Promise<any> {
        return this.handler.invokeWithMessage<SessionMessage>({
            sessionCommand: SessionCommand.message,
            sessionId: sessionId,
            payload
        });
    }

    onSessionNotification(callback: (data: SessionStateChangedNotification)=> void): void {
        this.handler.subscribeToTitledMessage(SessionStateChangedNotificationHeader, callback);
    }
}