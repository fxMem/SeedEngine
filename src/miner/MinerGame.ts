import { User } from "../users";
import { Field, Coordinates, TileActionResult, TileInfo } from "./Field";


export const MinerGameStateUpdateHeader = 'minerUpdate';

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

export interface MinerPlayerState {
    map: TileInfo[][];
    remainigLives: number;
    remainingFlags: number;

    isAlive: boolean;
}

export type MinerGameState = {
    data: { name: string, state: MinerPlayerState }[],
    winner: { name: string }
}

export class MinerGame {

    private fields = new Map<string, { field: Field, isAlive: boolean, remainigLives: number }>();
    private winner: string;
    constructor(private options: MinerGameOptions, private send: (data: any) => void) {

    }

    addPlayer({ nickname }: User) {
        if (!this.fields.has(nickname)) {
            this.fields.set(nickname, {
                field: new Field({ ...this.options, flags: this.options.flagsAvailable }),
                isAlive: true,
                remainigLives: this.options.lives
            });
        }
    }

    removePlayer({ nickname }: User) {
        this.fields.delete(nickname);
    }

    message({ nickname }: User, data: MinerMessage): TileActionResult | MinerGameState {
        
        if (data.action === MinerPlayerAction.checkState) {
            return this.buildGameState();
        }

        let field = this.fields.get(nickname).field;
        let result = this.makeMove(field, data);
        result.win && (this.winner = nickname);
        this.send(this.buildGameState());

        return result;
    }


    private makeMove(field: Field, data: MinerMessage): TileActionResult {
        let result: TileActionResult = null;

        switch (data.action) {
            case MinerPlayerAction.open:
                result = field.open(data.pos);
                break;
            case MinerPlayerAction.flag:
                result = field.flag(data.pos);
                break;
            case MinerPlayerAction.probe:
                result = field.probe(data.pos);
                break;
        }

        return result;
    }

    private buildGameState(): MinerGameState {

        return {
            data: Array.from(this.fields).map
            (
                f => 
                ({
                    name: f[0],
                    state: {
                        remainigLives: f[1].remainigLives,
                        remainingFlags: f[1].field.flagsRemain,
                        isAlive: f[1].isAlive,
                        map: f[1].field.getAllTilesData()
                    }
                })
            ), 
            winner: {
                name: this.winner
            }
        }
    }

    start() {

    }

    dispose() {
        this.fields.clear();

        // prob won't needed but whatever
        this.send = null;
    }
}