import { TileInfo } from "./Field";

export interface MinerPlayerState {
    map: TileInfo[][];
    fieldSize: { width: number, height: number };

    remainigLives: number;
    remainingFlags: number;

    isAlive: boolean;
}

export type MinerGameState = {
    data: { name: string, state: MinerPlayerState }[],
    winner: { name: string }
}

export const MinerGameStateUpdateHeader = 'minerUpdate';