import { createServer } from 'http';
import * as socketIO from 'socket.io';
import { MessageCallback } from "./MessagePipeline";
import { HandshakeModule, HandshakeInvite } from '@handshake';

export const messageHeader = 'seedMsg';

export class Server {

    private ioServer: socketIO.Server;

    constructor(private pipeline: MessageCallback, private handshake: HandshakeModule) {

    }

    listen(port: number) {
        this.ioServer = socketIO(createServer);

        this.ioServer.on('connection', client => {
            const userTransportId = client.id;

            client.on(messageHeader, async data => {
                let handshakeResult = this.handshake.identifyUser(userTransportId);
                if (handshakeResult instanceof HandshakeInvite) {
                    client.emit('handshake', handshakeResult);
                }
                else {
                    let responce = await this.pipeline({ ...data, user: handshakeResult });
                    client.emit('responce', responce);
                }
            });

            client.on('authentificate', async data => {
                let authResult = await this.handshake.authentificate(userTransportId, data);
                client.emit('authentificate', authResult);
            });

            client.on('disconnect', () => { 
                this.handshake.disconnectUser(userTransportId);
            });
        });
    }
}