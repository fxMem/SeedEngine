export enum TileState {
    Closed,
    Open,
    Flagged,
    Exploded
}

export interface TileInfo {
    state: TileState;
    value?: number;
}

export interface Coordinates {
    x: number;
    y: number;
}

export interface TileActionResult {
    gameOver: boolean;
    win: boolean;
}

enum TileAction {
    Open,
    Flag
}

const possibleActionsMap = {
    [TileState.Closed]: [TileAction.Open, TileAction.Flag],
    [TileState.Open]: [],
    [TileState.Flagged]: [TileAction.Flag],
    [TileState.Exploded]: []
}

function canPerformTileAction(state: TileState, action: TileAction): boolean {
    return possibleActionsMap[state].some(a => a === action);
}

class Tile {
    constructor(public state: TileState, public bomb: boolean, public value?: number) {

    }

    do(action: TileAction): boolean {
        if (!canPerformTileAction(this.state, action)) {
            throw new Error('Cant do requested action!')
        }

        let gameOver = false;
        function openTile() {
            this.bomb ? (gameOver = true, this.state = TileState.Open) : (this.state = TileState.Exploded);
        }

        switch (action) {
            case TileAction.Open:
                openTile();
                break;
            case TileAction.Flag:
                this.state == TileState.Flagged ? this.state = TileState.Open : this.state = TileState.Flagged;
                break;
            default:
                throw new Error(`Incorrect tile action ${action}`);
        }

        return gameOver;
    }

    getInfo(): TileInfo {
        let tileInfo = { state: this.state };
        switch (this.state) {
            case TileState.Closed:
            case TileState.Flagged:
            case TileState.Exploded:
                return tileInfo;
            case TileState.Open:
                return { ...tileInfo, value: this.value };
        }
    }
}

const moves = [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
export class Field {
    private grid: Tile[][];

    height: number;
    width: number;

    flagsRemain: number;
    hiddenBombs: number;
    flaggedBombs: number;

    constructor({ height, width, map, flags }: { height: number, width: number, flags: number, map: boolean[][] }) {
        this.height = height;
        this.width = width;
        this.flagsRemain = flags;

        const countNearBombs = (x: number, y: number): number => {
            let count = 0;

            // For now I don't want to encapsulate 'nearCells' method
            for (const move of moves) {
                let nextY = y + move[0];
                let nextX = x + move[1];

                if (this.isInsideGrid({ y: nextY, x: nextX }) && map[y][x]) {
                    count++;
                }
            }

            return count;
        }

        this.grid = [];
        for (let i = 0; i < height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.grid[i][j] = new Tile(TileState.Closed, map[i][j], countNearBombs(j, i));
            }
        }
    }

    getTileInfo({ y, x }: Coordinates): TileInfo {
        return this.grid[y][x].getInfo();
    }

    getAllTilesData(): TileInfo[][] {
        let data = [];
        for (let i = 0; i < this.height; i++) {
            data[i] = [];
            for (let j = 0; j < this.width; j++) {
                data[i].push(this.grid[i][j].getInfo());
            }
        }

        return data;
    }

    open(pos: Coordinates): TileActionResult {

        let tile = this.getTile(pos);
        return this.getResult(tile.do(TileAction.Open));
    }

    flag(pos: Coordinates): TileActionResult {

        let tile = this.getTile(pos);

        if (tile.state === TileState.Open && this.flagsRemain === 0) {
            throw new Error(`There is no flags left to put!`);
        }

        tile.do(TileAction.Flag);

        if (tile.state === TileState.Open) {
            this.flagsRemain--;
            tile.bomb && this.flaggedBombs++;
        }
        else {
            this.flagsRemain++;
            tile.bomb && this.flaggedBombs--;
        }

        return this.getResult(false);
    }

    probe(pos: Coordinates): TileActionResult {

        let tile = this.getTile(pos);
        let gameOver = tile.do(TileAction.Open);
        if (tile.value !== 0) {
            gameOver = true;
        }

        if (!gameOver) {
            this.openSegment(pos);
        }

        return this.getResult(gameOver);
    }

    private getResult(gameOver: boolean): TileActionResult {
        return {
            gameOver,
            win: this.hiddenBombs === 0
        };
    }

    private openSegment(pos: Coordinates) {
        let q = [pos];
        while (true) {
            if (q.length == 0) {
                break;
            }

            let { y, x } = q.shift();
            for (const move of moves) {
                let next = { y: y + move[0], x: x + move[1] };
                if (!this.isInsideGrid(next)) {
                    continue;
                }

                let tile = this.grid[y][x];

                if (tile.value === 0) {
                    q.push({ y, x });
                }

                if (tile.state === TileState.Closed) {
                    tile.do(TileAction.Open);
                }
            }
        }
    }

    private getTile(pos: Coordinates): Tile {
        this.ensureInsideGrid(pos);
        return this.grid[pos.y][pos.x];
    }

    private isInsideGrid({ y, x }: Coordinates): boolean {
        return 0 <= y && y < this.height && 0 <= x && x < this.width;
    }

    private ensureInsideGrid(pos: Coordinates) {
        if (!this.isInsideGrid(pos)) {
            throw new Error(`Position ${pos.x}:${pos.y} is not inside game field!`);
        }
    }
}