import { Message } from "../transport/Message";
import { SessionState } from "./SessionInfo";

export const SessionStateChangedNotificationHeader = 'sessionStateChanged';
export interface SessionStateChangedNotification {
    sessionId: string,
    nextState: SessionState,
    data?: any
}

export enum SessionCommand {
    getList,
    getOne,
    create,
    join,
    leave, 
    message
}

interface SessionSelectionOptions {
    sessionId?: string;
}

interface SessionCreationOptions {
    sessionDescription?: string;
    private?: boolean;
    join?: boolean;
}

interface SessionMessagePayload {
    payload?: any;
}

export interface SessionMessage extends Message, SessionSelectionOptions, SessionCreationOptions, SessionMessagePayload {
    sessionCommand: SessionCommand;
}

export function isSessionMessage(message: Message): message is SessionMessage {
    return (message as any).sessionCommand !== undefined;
}
