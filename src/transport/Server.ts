import { MessageCallback } from "./MessagePipeline";
import { AuthModule, User } from '@users';
import { Log } from '@log';
import { HttpFacade } from './HttpFacade';
import { Header } from './Headers';
import { Connection, ConnectedClient } from './Connection';

export class Server {
    private connection: Connection;

    constructor(
        private httpFacade: HttpFacade,
        private pipeline: MessageCallback,
        private authModule: AuthModule,
        private log: Log) { }

    listen(port: number): Promise<boolean> {
        this.connection = new Connection(this.httpFacade);
        this.connection.onConnected(this.handleClient);

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

    private handleClient(client: ConnectedClient): void {
        const userTransportId = client.id;

        const info = (message: string): void => {
            this.log.info(`Client ${userTransportId} :: ${message}`);
        };

        const handlers: { [key: string]: (user: User, data: any) => Promise<any> } = {
            [Header.Authenticate]: async (user: User, data: any) => {

                if (!data) {
                    return this.authModule.getInvitation();
                }

                return await this.authModule.authentificate(userTransportId, data);
            },
            [Header.Message]: (user: User, data: any) => this.pipeline({ ...data, user: user })
        };

        info(`Connected!`);

        client.onMessage(async data => {

            let { header, ...payload } = data;
            let user: User = null;
            if (header != Header.Authenticate) {
                let user = this.authModule.identifyUser(userTransportId);
                if (!user) {
                    header = Header.Authenticate;
                }
            }

            if (!(header in handlers)) {
                throw new Error(`Handler for message header ${header} is not found!`);
            }

            return handlers[header](user, payload);
        });


        client.onDisconnected(() => {
            this.authModule.disconnectUser(userTransportId);

            info(`Disconnected!`);
        });
    }
}