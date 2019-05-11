import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SimpleIdentityClient, DefaultSessionClient, VoteLobbyClient, KeyInvitationClient, GroupClient, ChatClient, ClientBuilder } from 'seedengine.client';
import { SessionInfo } from 'seedengine.client/session/SessionInfo';
import { OperationResult } from 'seedengine.client/core';


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

type Status = { pending: boolean, error?: string };

@Injectable({
  providedIn: 'root'
})
export class ClientServiceService {
  private connected: boolean;
  private operations$ = new Subject<Status>();
  client: ClientType;

  constructor() { }

  getPending(): Observable<Status> {
    return this.operations$;
  }

  async connect(nickname: string, password?: string): Promise<boolean> {
    return this.reportProgress((await this.connectedClient()).auth.authenticate(nickname, password));
  }

  async getSessions(): Promise<SessionInfo[]> {
    return this.reportProgress((await this.connectedClient()).sessions.allSessions());
  }

  async createSession(sessionDescription?: string, join?: boolean): Promise<{
    sessionId: string
    joined?: OperationResult
  }> {
    return this.reportProgress(
      (await this.connectedClient()).sessions.createSession(sessionDescription, join)
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
      this.operations$.next({ pending: false, error: (e as Error).message });
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

      this.client = await client.connect();
      this.connected = true;
    }

    return this.client;
  }
}
