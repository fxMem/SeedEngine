import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SimpleIdentityClient, DefaultSessionClient, VoteLobbyClient, KeyInvitationClient, GroupClient, ChatClient, ClientBuilder } from 'seedengine.client';
import { SessionInfo } from 'seedengine.client/session/SessionInfo';
import { OperationResult } from 'seedengine.client/core';
import { ServerError } from 'seedengine.client/server';
import { ErrorCode } from 'seedengine.client/transport/ErrorCodes';
import { VotesNotification } from 'seedengine.client/lobby/VoteMessage';
import { SessionStateChangedNotification } from 'seedengine.client/session/SessionMessage';


type ClientType = {
  auth: SimpleIdentityClient,
  sessions: DefaultSessionClient,
  votes: VoteLobbyClient,
  invites: KeyInvitationClient,
  groups: GroupClient,
  chat: ChatClient
}
// type SessionInfo = {};
// type OperationResult = {};

type Status = { pending: boolean, error?: string, code?: ErrorCode };

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {
  private connected: boolean;
  private operations$ = new Subject<Status>();
  private votes$ = new Subject<VotesNotification>();
  private sessionUpdates$ = new Subject<SessionStateChangedNotification>();

  client: ClientType & ClientBuilder;

  constructor() { }

  getPending(): Observable<Status> {
    return this.operations$;
  }

  getVotes(): Observable<VotesNotification> {
    return this.votes$;
  }

  getSessionStateChanges(): Observable<SessionStateChangedNotification> {
    return this.sessionUpdates$;
  }

  async connect(nickname: string, password?: string): Promise<boolean> {
    return this.reportProgress((await this.connectedClient()).auth.authenticate(nickname, password));
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
    this.operations$.next({ pending: true });
    try {
      let result = await input;
      this.operations$.next({ pending: false });
      return result;
    }
    catch (e) {
      let serverError = e as ServerError;
      this.operations$.next({ pending: false, error: (serverError).message, code: serverError.code });
      throw e;
    }
  }

  private async connectedClient(): Promise<ClientType> {
    if (!this.connected) {
      let client = new ClientBuilder()
        .addClientInterface({ auth: new SimpleIdentityClient() })
        .addClientInterface({ sessions: new DefaultSessionClient() })
        .addClientInterface({ votes: new VoteLobbyClient() })
        .addClientInterface({ invites: new KeyInvitationClient() })
        .addClientInterface({ groups: new GroupClient() })
        .addClientInterface({ chat: new ChatClient() });

      client.onMessage((message) => {

        return null;
      });

      client.votes.onVotesUpdate((v) => {
        this.votes$.next(v);
      });

      client.sessions.onSessionNotification((d) => {
        this.sessionUpdates$.next(d);
      });

      this.client = await client.connect();

      this.connected = true;
    }

    return this.client;
  }
}
