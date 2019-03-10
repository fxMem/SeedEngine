
import { DefaultSessionClient } from "@session/SessionClient";
import { ClientBuilder } from "@client/ClientBuilder";
import { DefaultAuthClient } from "@users/AuthClient";

localStorage.debug = '*';

new ClientBuilder()
    .addClientInterface({ auth: new DefaultAuthClient() })
    .addClientInterface({ sessions: new DefaultSessionClient() })
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

        //client.
    });

