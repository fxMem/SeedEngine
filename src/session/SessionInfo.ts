export enum SessionState {
    waiting,
    running,
    halted,
    finished
}

export interface SessionInfo {
    id: string;
    state: SessionState;
    private: boolean;

    playersCount: number;
    timePassed: Date;
    description: string;
}