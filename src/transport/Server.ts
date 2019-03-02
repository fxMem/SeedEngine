import { MessagePipelineCallback } from "./MessagePipeline";
import { AuthModule } from '@users';
import { Log } from '@log';
import { Header } from './Headers';
import { Connection, ConnectedClient } from "./Connection";
import { User } from "users/User";

// Facade class tying together connection, authentication and messaging logic
export class Server {

    constructor(
        private connection: Connection,
        private pipeline: MessagePipelineCallback,
        private authModule: AuthModule,
        private log: Log) { }

    listen(port: number): void {
        this.connection.onConnected(this.handleClient.bind(this));
        this.connection.start({ port });
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

            info(JSON.stringify(data));

            let { header, payload } = data;
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

            try {
                let result = await handlers[header](user, payload);

                info(`Sending a responce - ${JSON.stringify(result)}`);
                return result;
            } catch (e) {
                this.log.error(e.toString());
            }
        });


        client.onDisconnected(() => {
            this.authModule.disconnectUser(userTransportId);

            info(`Disconnected!`);
        });
    }
}