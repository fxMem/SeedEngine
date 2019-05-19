export enum SessionState {
    waiting,
    running,
    halted,
    finished
}

export interface SessionInfo {
    id: string;
    state: SessionState;

    playersCount: number;
    timePassed: Date;
    description: string;
}