import { MessagePipelineCallback } from "./MessagePipeline";
import { MessageSender } from "./MessageSender";
import { ServerError, UnauthorizedError } from "./ServerError";
import { UserDisconnectedContext } from "./UserDisconnectedContext";
import { createLocalLogScope } from "../log/LoggerScopes";
import { Connection, ConnectedClient } from "./Connection";
import { Users } from "../users/Users";
import { AuthModule } from "../users/AuthModule";
import { User } from "../users/User";
import { Header } from "./Headers";

// Facade class tying together connection, authentication and messaging logic
export class Server {

    private log = createLocalLogScope('Server');
    constructor(
        private connection: Connection,
        private users: Users,
        private sender: MessageSender,
        private pipeline: MessagePipelineCallback,
        private authModule: AuthModule) { }

    listen(port: number): void {
        this.connection.start({ port });
        this.connection.onConnected(this.handleClient.bind(this));
    }

    private handleClient(client: ConnectedClient): void {
        const userTransportId = client.id;

        const info = (message: string): void => {
            this.log.info(`Client ${userTransportId} :: ${message}`);
        };

        const logError = (e: any): void => {
            if (e instanceof Error) {
                this.log.error(e.toString() + e.stack);
            }
            else if (e instanceof ServerError) {
                // This is expected exception, meant user did something wrong
                info(e.toString());
            }
        };

        const handlers: { [key: string]: (user: User, data: any) => Promise<any> } = {
            [Header.Authenticate]: async (user: User, data: any) => {

                if (!data) {
                    return this.authModule.getInvitation();
                }

                return await this.authModule.authentificate(userTransportId, data);
            },
            [Header.Message]: (user: User, data: any) => this.pipeline({
                message: { ...data },
                from: user,

                users: this.users,
                sender: this.sender
            })
        };

        info(`Connected!`);

        client.onMessage(async data => {

            info(JSON.stringify(data));

            let { header, payload } = data;
            let user: User = null;
            
            try {
                if (header != Header.Authenticate) {
                    user = this.authModule.identifyUser(userTransportId);
                    if (!user) {
                        throw new UnauthorizedError(`User is not authenticated!`);
                    }
                }
    
                if (!(header in handlers)) {
                    throw new Error(`Handler for message header ${header} is not found!`);
                }

                let result = await handlers[header](user, payload);

                if (result !== undefined) {
                    info(`Sending a responce - ${JSON.stringify(result)}`);
                    return result;
                }
            } catch (e) {

                logError(e);
                return { failed: true, errorCode: e.code, message: e.message };
            }
        });


        client.onDisconnected(() => {
            try {
                let user = this.authModule.identifyUser(userTransportId);
                if (user) {
                    this.pipeline(new UserDisconnectedContext(user, this.users, this.sender));
                    this.authModule.disconnectUser(userTransportId);
    
                    info(`Disconnected!`);
                }
                else {
                    info(`Attempt to disconnect, but user is not connected!`);
                }         
            }
            catch (e) {
                logError(e);
            }
        });
    }
}