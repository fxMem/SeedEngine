import { User } from "@core";

export enum SessionState {
    waiting,
    running,
    finished
}

export interface SessionInfo {
    state: SessionState;

    description: string;
}

export interface Session {
    join(user: User): { success: boolean };

    leave(user: User): void;

    info: SessionInfo;
}