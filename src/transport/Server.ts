import { createServer } from 'http';
import * as socketIO from 'socket.io';
import { MessageCallback } from "./MessagePipeline";
import { AuthModule, AuthInvite } from '@users';
import { Logger } from '@log';

export const messageHeader = 'seedMsg';

export class Server {

    private ioServer: socketIO.Server;

    constructor(
        private pipeline: MessageCallback,
        private authModule: AuthModule,
        private logger: Logger) { }

    listen(port: number) {
        this.ioServer = socketIO(createServer);

        this.ioServer.on('connection', client => {
            const userTransportId = client.id;

            client.on(messageHeader, async data => {
                let authResult = this.authModule.identifyUser(userTransportId);
                if (authResult instanceof AuthInvite) {
                    client.emit('handshake', authResult);
                }
                else {
                    let responce = await this.pipeline({ ...data, user: authResult });
                    client.emit('responce', responce);
                }
            });

            client.on('authentificate', async data => {
                let authResult = await this.authModule.authentificate(userTransportId, data);
                client.emit('authentificate', authResult);
            });

            client.on('disconnect', () => {
                this.authModule.disconnectUser(userTransportId);
            });
        });
    }
}