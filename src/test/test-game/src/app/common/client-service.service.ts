import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MinerClient, SimpleIdentityClient, DefaultSessionClient, VoteLobbyClient, KeyInvitationClient, GroupClient, ChatClient, ClientBuilder } from 'seedengine.client';
import { SessionInfo } from 'seedengine.client/session/SessionInfo';
import { OperationResult } from 'seedengine.client/core';
import { ErrorCode } from 'seedengine.client/transport/ErrorCodes';
import { VotesNotification } from 'seedengine.client/lobby/VoteMessage';
import { SessionStateChangedNotification } from 'seedengine.client/session/SessionMessage';
import { MinerGameState } from 'seedengine.client/miner/MinerGame';
import { Coordinates, TileActionResult } from 'seedengine.client/miner/Field';
import { PendingService } from './loading-service.service';


type ClientType = {
  auth: SimpleIdentityClient,
  sessions: DefaultSessionClient,
  votes: VoteLobbyClient,
  invites: KeyInvitationClient,
  groups: GroupClient,
  chat: ChatClient,
  game: MinerClient
}
// type SessionInfo = {};
// type OperationResult = {};

type Status = { pending: boolean, error?: string, code?: ErrorCode };

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {
  private connected: boolean;
  nickname: string;

  private votes$ = new Subject<VotesNotification>();
  private sessionUpdates$ = new Subject<SessionStateChangedNotification>();
  private gameUpdates$ = new Subject<MinerGameState>();

  client: ClientType & ClientBuilder;

  constructor(private pending: PendingService) { }

  

  getVotes(): Observable<VotesNotification> {
    return this.votes$;
  }

  getSessionStateChanges(): Observable<SessionStateChangedNotification> {
    return this.sessionUpdates$;
  }

  getGameStateChanges(): Observable<MinerGameState> {
    return this.gameUpdates$;
  }

  async connect(nickname: string, password?: string): Promise<boolean> {
    var res = await this.reportProgress((await this.connectedClient()).auth.authenticate(nickname, password));
    this.nickname = nickname;

    return res;
  }

  async getMinerState(sessionId: string): Promise<MinerGameState> {
    return this.reportProgress((await this.connectedClient()).game.getState(sessionId));
  }

  async probe(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
    return this.reportProgress((await this.connectedClient()).game.probe(sessionId, pos));
  }

  async open(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
    return this.reportProgress((await this.connectedClient()).game.open(sessionId, pos));
  }

  async flag(sessionId: string, pos: Coordinates): Promise<TileActionResult> {
    return this.reportProgress((await this.connectedClient()).game.flag(sessionId, pos));
  }

  async getSessions(): Promise<SessionInfo[]> {
    return this.reportProgress((await this.connectedClient()).sessions.allSessions());
  }

  async getSession(sessionId: string): Promise<SessionInfo> {
    return this.reportProgress((await this.connectedClient()).sessions.getSingleSessionInfo(sessionId));
  }

  async createSession(sessionDescription?: string, join?: boolean): Promise<{
    sessionId: string
    joined?: OperationResult
  }> {
    return this.reportProgress(
      (await this.connectedClient()).sessions.createSession(sessionDescription, join)
    );
  }

  async joinSession(sessionId: string) {
    return this.reportProgress(
      (await this.connectedClient()).sessions.joinSession(sessionId)
    );
  }

  async vote(sessionId: string, vote: boolean) {
    return this.reportProgress(
      (await this.connectedClient()).votes.vote(sessionId, vote)
    );
  }

  private async  reportProgress<T>(input: Promise<T>): Promise<T> {
    return this.pending.reportProgress(input);
  }

  private async connectedClient(): Promise<ClientType> {
    if (!this.connected) {
      let client = new ClientBuilder()
        .addClientInterface({ auth: new SimpleIdentityClient() })
        .addClientInterface({ sessions: new DefaultSessionClient() })
        .addClientInterface({ votes: new VoteLobbyClient() })
        .addClientInterface({ invites: new KeyInvitationClient() })
        .addClientInterface({ groups: new GroupClient() })
        .addClientInterface({ chat: new ChatClient() })
        .addClientInterface({ game: new MinerClient() });

      client.onMessage((message) => {

        return null;
      });

      client.votes.onVotesUpdate((v) => {
        this.votes$.next(v);
      });

      client.sessions.onSessionNotification((d) => {
        this.sessionUpdates$.next(d);
      });

      client.game.onGameStateUpdate((d) => {
        this.gameUpdates$.next(d);
      })

      this.client = await client.connect();

      this.connected = true;
    }

    return this.client;
  }
}
