import { Instance, DefaultInstance, InstanceOptions } from "./Instance";
import { DefaultUserManager, AuthMethod, AuthModule, UserStorage } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler, HttpFacadeFactory, Connection, SocketIOServerTransport, makeRegularHandler } from "@transport";
import { MessageSender } from "@transport/MessageSender";
import { LobbyModule, LobbyPipeline } from "@lobby";

export class Bootstrapper {
    private facadeFactory: HttpFacadeFactory;
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[] = [];
    private userStorage: UserStorage;
    private options: InstanceOptions = {
        port: 8080
    };

    constructor() {
        this.pipeline = new DefaulMessagePipeline();
    }

    build(): Instance {
        
        let serverTransport = new SocketIOServerTransport(this.facadeFactory.create());
        let userManager = new DefaultUserManager();
        let connection = new Connection(serverTransport);
        let messageSender = new MessageSender(serverTransport);

        let server = new Server(
            connection,
            userManager,
            messageSender,
            this.pipeline.build(),
            new AuthModule(userManager, this.authMethods, this.userStorage));

        return new DefaultInstance(this.options, server);
    }

    withHttpFacade(facadeFactory: HttpFacadeFactory): this {
        return (this.facadeFactory = facadeFactory) && this;
    }

    withAuthMethod(method: AuthMethod): this {
        return this.authMethods.push(method) && this;
    }

    withStorage(storage: UserStorage): this {
        return (this.userStorage = storage) && this;
    }

    withLobbyModule(lobbyModule: LobbyModule): this {
        return this.add(makeRegularHandler(new LobbyPipeline(lobbyModule, null)));
    }

    add(handler: MessageHandler): this {
        return this.pipeline.chain(handler) && this;
    }
}