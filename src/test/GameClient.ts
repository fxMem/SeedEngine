import { ClientBuilder, DefaultSessionClient, VoteLobbyClient, KeyInvitationClient, GroupClient, ChatClient, SimpleIdentityClient } from "../client";

type ClientType = {
    auth: SimpleIdentityClient,
    sessions: DefaultSessionClient,
    votes: VoteLobbyClient,
    invites: KeyInvitationClient,
    groups: GroupClient,
    chat: ChatClient
}
export class GameClient {

    private client: ClientType;
    private connected = false;

    async connect(nickname: string): Promise<any> {
        (await this.connectedClient()).auth.authenticate(nickname);
    }

    private async connectedClient() {
        if (this.connected) { 
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