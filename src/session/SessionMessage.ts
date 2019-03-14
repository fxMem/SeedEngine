import { Message } from "@transport";

export enum SessionCommand {
    getList,
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
    command: SessionCommand;
}

export function isSessionMessage(message: Message): message is SessionMessage {
    return (message as any).command !== undefined;
}

export interface SessionJoiningResult {
    success: boolean;
    message?: string;
}