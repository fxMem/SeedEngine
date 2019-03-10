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

export interface SessionJoiningResult {
    success: boolean;
    message?: string;
}