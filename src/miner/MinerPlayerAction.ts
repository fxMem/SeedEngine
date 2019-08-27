import { Coordinates } from "./Field";

export interface MinerGameOptions {
    map: boolean[][];

    height: number;
    width: number;
    flagsAvailable: number;
    lives: number;
}

export enum MinerPlayerAction {
    open,
    flag,
    probe,
    checkState
}

export interface MinerMessage {
    pos: Coordinates;
    action: MinerPlayerAction
}