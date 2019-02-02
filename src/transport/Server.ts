import * as socketIO from 'socket.io';
import { MessageCallback } from "./MessagePipeline";
import { AuthModule, AuthInvite } from '@users';
import { Log } from '@log';
import { HttpFacade } from './HttpFacade';

export const messageHeader = 'seedMsg';

export class Server {

    private ioServer: socketIO.Server;

    constructor(
        private httpFacade: HttpFacade,
        private pipeline: MessageCallback,
        private authModule: AuthModule,
        private log: Log) { }

    listen(port: number): Promise<boolean> {
        this.ioServer = socketIO(this.httpFacade);
        this.ioServer.on('connection', this.handleClient.bind(this));

        return new Promise<boolean>((resolve, reject) => {
            this.httpFacade.listen(port, (error) => {
                if (error) {
                    this.log.error(error);
                    reject();
                }
                else {
                    this.log.info(`Server started, listening on ${port}`);
                    resolve();
                }
            });
        });
    }

    private handleClient(client: socketIO.Socket): void {
        const userTransportId = client.id;
        const info = (message: string): void => {
            this.log.info(`Client ${userTransportId} :: ${message}`);
        };

        info(`Connected!`);

        client.on(messageHeader, async data => {
            let authResult = this.authModule.identifyUser(userTransportId);
            if (authResult instanceof AuthInvite) {
                info(`User not recognised! Sent invitation to authenticate...`);
                client.emit('handshake', authResult);
            }
            else {
                info(`Message from user: ${authResult.nickname}`);
                let responce = await this.pipeline({ ...data, user: authResult });
                info(`Responce: ${responce}`);

                client.emit('responce', responce);
            }
        });

        client.on('authenticate', async data => {
            let authResult = await this.authModule.authentificate(userTransportId, data);
            client.emit('authenticate', authResult);

            info(`Attempt to authenticate, result = ${authResult}`);
        });

        client.on('disconnect', () => {
            this.authModule.disconnectUser(userTransportId);

            info(`Disconnected!`);
        });
    }
}