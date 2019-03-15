
import { DefaultSessionClient } from "@session/SessionClient";
import { ClientBuilder } from "@client/ClientBuilder";
import { DefaultAuthClient } from "@users/AuthClient";
import { VoteLobbyClient } from "@lobby/VoteLobbyClient";
import { KeyInvitationClient } from "@invite/KeyInvitationClient";
import { GroupClient } from "@groups/GroupClient";
import { ChatClient } from "@chat/ChatClient";

localStorage.debug = '*';

new ClientBuilder()
    .addClientInterface({ auth: new DefaultAuthClient() })
    .addClientInterface({ sessions: new DefaultSessionClient() })
    .addClientInterface({ votes: new VoteLobbyClient() })
    .addClientInterface({ invites: new KeyInvitationClient() })
    .addClientInterface({ groups: new GroupClient() })
    .addClientInterface({ chat: new ChatClient() })
    .connect()
    .then(async (client) => {

        console.log('connected!');

        let handlers = {
            openTile: (p) => {
                let tiles: [] = p.tiles;
                for (let tile of tiles) {
                    let { playerId, tileInfo } = tile;

                    // display update
                }
            },

            finish: (p) => {
                let { winner } = p;


                // display scores
            }
        }

        client.onMessage(async (message) => {

            let handler = handlers[message.header];
            if (!handler)
                throw new Error('Handler not found!');

            handlers[message.header](message.payload);
        });

        let authResult = await client.auth.authenticate('0', { nickname: 'root', password: 'root' });
        if (!authResult) {
            throw new Error('Cant authorize');
        }


        let { sessionId } = await client.sessions.createSession('test session', true);
        var sessions = await client.sessions.allSessions();

        let invite = await client.invites.createInvite(sessionId, 1);
        console.log(invite.inviteKey);

        let group = await client.groups.createGroup();
        await client.chat.send(group.groupId,  "test message");
        //await client.groups.leaveGroup(group.groupId);

        await client.votes.vote(sessionId);
    });

