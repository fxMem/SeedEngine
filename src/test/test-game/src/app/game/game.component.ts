import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as PIXI from 'pixi.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  private pixiApp: PIXI.Application;
  @ViewChild('field') field: ElementRef;

  constructor() { }

  ngOnInit() {
    this.pixiApp = new PIXI.Application({
      width: 300,
      height: 300
    });
    (this.field.nativeElement  as HTMLElement).insertAdjacentElement('beforeend', this.pixiApp.view);
  }

}
