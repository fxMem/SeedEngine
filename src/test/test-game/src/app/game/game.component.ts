import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as PIXI from 'pixi.js';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientServiceService } from '../common/client-service.service';
import { PendingService } from '../common/loading-service.service';
import { MinerGameState, MinerPlayerState } from 'seedengine.client/miner/MinerGame';
import { TileInfo, TileState } from 'seedengine.client/miner/Field';
import { Texture } from 'pixi.js';

type ExtendedSprite = PIXI.Sprite & {
  coordinates?: Coordinates,
  probingCounter?: number;
  probeInProcess?: boolean;
};

const tileSize = 40;
const tileAtlas = 'assets/data.json';
const assets = {
  flag: 1,
  bomb: 0,
  pressed: 2,
  notPressed: 11,
  '0': 2,
  '1': 3,
  '2': 4,
  '3': 5,
  '4': 6,
  '5': 7,
  '6': 8,
  '7': 9,
  '8': 10,
}


type Coordinates = {
  x: number,
  y: number
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  @Input() sessionId: string;

  private fields: { [key: string]: MinerPlayerState } = {};
  private tiles: PIXI.Sprite[][] = [];
  private pixiApp: PIXI.Application;
  private loader: PIXI.Loader;
  @ViewChild('field') field: ElementRef;

  private fieldWidth: number;
  private enemyFieldOffset: Coordinates;
  private totalWidth: number;
  private totalHeight: number;

  constructor(
    private router: Router,
    private client: ClientServiceService,
    private pending: PendingService) {
  }

  async ngOnInit() {
    this.pending.reportProgress((async () => {

      let state = await this.client.getMinerState(this.sessionId);
      let playerState = this.getPlayerState(state);

      this.fieldWidth = playerState.fieldSize.width * tileSize;

      this.enemyFieldOffset = { x: this.fieldWidth + 100, y: 0 };

      this.totalWidth = this.enemyFieldOffset.x + this.fieldWidth + 100;
      this.totalHeight = playerState.fieldSize.height * tileSize + 100;

      this.pixiApp = new PIXI.Application({
        width: this.totalWidth,
        height: this.totalHeight,

      });

      this.loader = new PIXI.Loader();
      (this.field.nativeElement as HTMLElement).insertAdjacentElement('beforeend', this.pixiApp.view);
      this.pixiApp.view.addEventListener('contextmenu', (e) => { e.preventDefault(); });
      
      // This code is requered in order to avoid pointers api limitations, for details see
      // https://github.com/pixijs/pixi.js/issues/5625
      const interactionDOMElement = (this.pixiApp.renderer.plugins.interaction as any).interactionDOMElement;
      (this.pixiApp.renderer.plugins.interaction as any).removeEvents();
      (this.pixiApp.renderer.plugins.interaction as any).supportsPointerEvents = false;
      this.pixiApp.renderer.plugins.interaction.setTargetElement(interactionDOMElement);

      let loadingText = this.createLoadingSprite();
      this.pixiApp.stage.addChild(loadingText);



      await new Promise((resolve, reject) => {
        this.loader.add(tileAtlas).load(() => {
          resolve();
        });
      });

      this.updateAllFields(state);
      this.pixiApp.stage.removeChild(loadingText);

      this.client.getGameStateChanges().subscribe(s => {
        this.updateAllFields(s);
      });

    })());

  }

  private createLoadingSprite() {
    let loadingText = new PIXI.Text('Loading...', new PIXI.TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
      stroke: '#ff3300',
      strokeThickness: 4,
    }));
    loadingText.height = 50;
    loadingText.width = 200;
    loadingText.y = this.totalHeight / 2 - loadingText.height / 2;
    loadingText.x = this.totalWidth / 2 - loadingText.width / 2;

    return loadingText;
  }

  private getPlayerState(state: MinerGameState, player?: string): MinerPlayerState {
    player = player || this.client.nickname;
    return state.data.find(s => s.name === player).state;
  }

  private getPlayerField(player?: string): MinerPlayerState {
    player = player || this.client.nickname;
    return this.fields[player];
  }

  private updateAllFields(state: MinerGameState) {
    for (let prop in state.data) {
      let playerState = state.data[prop];
      let offset = playerState.name === this.client.nickname ? { x: 0, y: 0 } : this.enemyFieldOffset;

      this.updateField(playerState.name, playerState.state, offset);
    }
  }

  private updateField(stateId: string, state: MinerPlayerState, offset: Coordinates) {
    let currentState = this.fields[stateId];

    if (!currentState) {
      this.fields[stateId] = state;
      currentState = state;
    }

    let currentMap = currentState.map;
    let newMap = state.map;

    for (let i = 0; i < currentMap.length; i++) {
      for (let j = 0; j < currentMap[i].length; j++) {
        let currentTile = currentMap[i][j];
        let newTile = newMap[i][j];

        if (!this.tiles[i]) {
          this.tiles[i] = []
        }

        let sprite = this.tiles[i][j];

        if (currentTile && currentTile.state === newTile.state && sprite) {
          continue;
        }

        if (sprite) {
          this.removeSprite(sprite);
        }

        this.tiles[i][j] = this.addSpriteForTile(newTile, { y: i, x: j }, offset);
        currentMap[i][j] = newTile;
      }
    }
  }

  private addSpriteForTile(tile: TileInfo, pos: Coordinates, offset: Coordinates): PIXI.Sprite {
    let sprite = this.createSprite(tile, pos);
    this.addSprite(sprite, pos, offset);
    return sprite;
  }

  private addSprite(sprite: PIXI.Sprite, { x, y }, offset: Coordinates) {

    sprite.x = x * tileSize + offset.x;
    sprite.y = y * tileSize + offset.y;
    sprite.width = tileSize;
    sprite.height = tileSize;
    this.pixiApp.stage.addChild(sprite);
  }

  private removeSprite(sprite: PIXI.Sprite) {
    this.pixiApp.stage.removeChild(sprite);
  }

  private updateSprite(sprite: PIXI.Sprite, tile: TileInfo) {
    let texture = this.getTexture(tile);
    sprite.texture = texture;
  }

  private _openableStates = [TileState.Closed];
  private _switchableStates = [TileState.Closed, TileState.Flagged];
  private _probableStates = [TileState.Closed];

  private open({ x, y }: Coordinates) {
    let state = this.getPlayerField();
    let currentState = state.map[y][x];
    if (this._openableStates.find(s => s == currentState.state) === null) {
      return;
    }

    this.client.open(this.sessionId, { x, y });
  }

  private switchFlag({ x, y }: Coordinates) {
    let state = this.getPlayerField();
    let currentState = state.map[y][x];
    if (this._switchableStates.find(s => s == currentState.state) === null) {
      return;
    }

    this.client.flag(this.sessionId, { x, y });
  }

  private probe({ x, y }: Coordinates) {
    let state = this.getPlayerField();
    let currentState = state.map[y][x];
    if (this._probableStates.find(s => s == currentState.state) === null) {
      return;
    }

    this.client.probe(this.sessionId, { x, y });
  }

  private createSprite(tile: TileInfo, coordinates: Coordinates) {
    let sprite: ExtendedSprite = new PIXI.Sprite(this.getTexture(tile))
      .on('mousedown', leftDown)
      .on('mouseup', leftUp)
      .on('rightdown', rightDown)
      .on('rightup', rightUp);

    sprite.interactive = true;
    sprite.coordinates = coordinates;
    sprite.buttonMode = true;
    sprite.probingCounter = 0;
    sprite.probeInProcess = false;

    let controller = this;
    return sprite;

    function leftDown() {
      let sprite = this as ExtendedSprite;
      sprite.probingCounter++;

      if (sprite.probingCounter == 2) {
        sprite.probeInProcess = true;
      }
    }

    function rightDown() {
      let sprite = this as ExtendedSprite;
      sprite.probingCounter++;

      if (sprite.probingCounter == 2) {
        sprite.probeInProcess = true;
      }
    }

    function leftUp() {
      let sprite = this as ExtendedSprite;
      sprite.probingCounter--;

      if (!sprite.probeInProcess) {
        controller.open(sprite.coordinates);
       
      }
      else if (sprite.probingCounter == 0){
        controller.probe(sprite.coordinates);
        sprite.probeInProcess = false;
      }
    }

    function rightUp() {
      let sprite = this as ExtendedSprite;
      sprite.probingCounter--;

      if (!sprite.probeInProcess) {
        controller.switchFlag(sprite.coordinates);
       
      }
      else if (sprite.probingCounter == 0){
        controller.probe(sprite.coordinates);
        sprite.probeInProcess = false;
      }
    }
  }

  private getTexture(tile: TileInfo): Texture {
    let name: number;
    switch (tile.state) {
      case TileState.Closed:
        name = assets.notPressed;
        break;
      case TileState.Exploded:
        name = assets.bomb;
        break;
      case TileState.Flagged:
        name = assets.flag;
        break;
      case TileState.Open:
        name = assets[tile.value];
        break;
    }

    return this.loader.resources[tileAtlas].textures[name];
  }

}
