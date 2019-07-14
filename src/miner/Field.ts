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
    blewOver: boolean;
    win: boolean;
}

enum TileAction {
    Open,
    Flag,
    Probe
}

const possibleActionsMap = {
    [TileState.Closed]: [TileAction.Open, TileAction.Flag],
    [TileState.Open]: [TileAction.Probe],
    [TileState.Flagged]: [TileAction.Flag],
    [TileState.Exploded]: []
}

function canPerformTileAction(state: TileState, action: TileAction): boolean {
    return possibleActionsMap[state].some(a => a === action);
}

class Tile {
    constructor(public pos: Coordinates, public state: TileState, public bomb: boolean, public value?: number) {

    }

    do(action: TileAction): boolean {
        if (!canPerformTileAction(this.state, action)) {
            throw new Error('Can\'t do requested action!')
        }

        let gameOver = false;
        const openTile = () => {
            this.bomb ? (gameOver = true, this.state = TileState.Exploded) : (this.state = TileState.Open);
        }

        switch (action) {
            case TileAction.Open:
                openTile();
                break;
            case TileAction.Flag:
                this.state == TileState.Flagged ? this.state = TileState.Closed : this.state = TileState.Flagged;
                break;
            case TileAction.Probe:
                // we don't do anything here as probing logic requeres managing all field
                // this method just ensures that probing is allowed.
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

            for (const coords of this.getNearTileCoordinates({ y, x })) {
                if (map[coords.y][coords.x]) {
                    count++;
                }
            }

            return count;
        }

        this.grid = [];
        for (let i = 0; i < height; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.grid[i][j] = new Tile({ y: i, x: j }, TileState.Closed, map[i][j], countNearBombs(j, i));
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
        return this.getResult(this.openSegmentWithCenter(tile));
    }

    flag(pos: Coordinates): TileActionResult {

        let tile = this.getTile(pos);

        if (tile.state === TileState.Closed && this.flagsRemain === 0) {
            throw new Error(`There is no flags left to put!`);
        }

        tile.do(TileAction.Flag);

        if (tile.state === TileState.Flagged) {
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

        // we have to call this in order to make sure action is allowed. 
        let blewOver = tile.do(TileAction.Probe);
        
        // Open all nearby tiles
        for (const nearTile of this.getNearTiles(pos)) {
            if (nearTile.state === TileState.Closed) {
                blewOver = this.openSegmentWithCenter(nearTile);
            }
        }

        return this.getResult(blewOver);
    }

    private getResult(blewOver: boolean): TileActionResult {
        return {
            blewOver,
            win: this.hiddenBombs === 0
        };
    }

    private openSegmentWithCenter(tile: Tile): boolean {
        if (tile.do(TileAction.Open)) {
            // we got blown up on the first tile.
            return true;
        }

        if (tile.value > 0) {
            // We don't open nearby tiles if we have bomb in neighbor tile
            return false;
        }   

        // Otherwise, we're good. We only open free tiles so we can't lose here.
        let q = [tile.pos];
        while (true) {
            if (q.length == 0) {
                break;
            }

            let { y, x } = q.shift();
            for (const tile of this.getNearTiles({ y, x })) {
                
                if (tile.state === TileState.Closed) {
                    tile.do(TileAction.Open);

                    if (tile.value === 0) {
                        q.push(tile.pos);
                    }
                }
            }
        }

        return false;
    }

    private getNearTiles({ x, y }: Coordinates): Tile[] {
        return this.getNearTileCoordinates({ y, x }).map(c => this.grid[c.y][c.x]);
    }

    private getNearTileCoordinates({ x, y }: Coordinates): Coordinates[] {
        let result = [];
        for (const move of moves) {
            let next = { y: y + move[0], x: x + move[1] };
            if (!this.isInsideGrid(next)) {
                continue;
            }

            result.push({ x: next.x, y: next.y });
        }

        return result;
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