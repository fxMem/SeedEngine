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
    leave
}

interface SessionSelectionOptions {
    sessionId?: string;
}

interface SessionCreationOptions {
    sessionDescription?: string;
    join?: boolean;
}

export interface SessionMessage extends Message, SessionSelectionOptions, SessionCreationOptions {
    sessionCommand: SessionCommand;
}

export function isSessionMessage(message: Message): message is SessionMessage {
    return (message as any).sessionCommand !== undefined;
}
