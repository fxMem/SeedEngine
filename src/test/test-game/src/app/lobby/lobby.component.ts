import { Component, OnInit } from '@angular/core';
import { ClientServiceService } from '../common/client-service.service';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, from, concat, defer } from 'rxjs';
import { delay, tap, skip, concatMap } from 'rxjs/operators';
import { SessionInfo } from '../../../../../../distr/client/session/SessionInfo';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  private sessions$: Observable<SessionInfo[]>;
  private loader = new BehaviorSubject(0);
  private description: FormControl;

  constructor
    (
      private client: ClientServiceService,
      private router: Router
    ) { 
      this.description = new FormControl('');
    }

  ngOnInit() {
    let sessions = defer(() => this.client.getSessions());
    let refresh = of(0).pipe(
      delay(5000),
      tap(_ => this.loader.next(0)),
      skip(1)
    );

    let loadAndWait = concat(sessions, refresh);
    this.sessions$ = this.loader.pipe(
      concatMap(_ => loadAndWait)
    ) as Observable<SessionInfo[]>;
  }

  add() {
    let description = this.description.value;
    this.client.createSession(description, true);
  }

}
