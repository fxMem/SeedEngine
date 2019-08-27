import { Component, OnInit } from '@angular/core';
import { ClientServiceService } from '../common/client-service.service';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject, from, concat, defer } from 'rxjs';
import { delay, tap, skip, concatMap, switchMap } from 'rxjs/operators';
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

  public lastInvite: string;

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
      //tap(_ => this.loader.next(0)),
      skip(1)
    );

    let loadAndWait = concat(sessions, refresh);
    this.sessions$ = this.loader.pipe(
      switchMap(_ => loadAndWait)
    ) as Observable<SessionInfo[]>;
  }

  reload() {
    this.loader.next(0);
  }

  add() {
    let description = this.description.value;
    this.client.createSession(description, false).then(r => {
      this.loader.next(0);
    });
  }

  join(sessionId: string) {
    this.client.joinSession(sessionId).then(res => {
      if (res.success) {
        this.router.navigate(['room', sessionId]);
      }
    })
  }

  createInvite(sessionId: string) {
    const inviteError = () => {
      this.lastInvite = `Couldn't create invite!`;
    }
    this.client.createInvite(sessionId, `${this.client.nickname} invites you to join the game!`).then(res => {
      if (res.success) {
        this.lastInvite = `${window.location.host}/invite/${res.inviteKey}`;
      }
      else {
        inviteError();
      }

    }, (e) => { inviteError(); });


  }

}
