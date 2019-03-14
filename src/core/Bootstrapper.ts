import { Instance, DefaultInstance, InstanceOptions } from "./Instance";
import { DefaultUserManager, AuthMethod, AuthModule, UserStorage, UserManager } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler, HttpFacadeFactory, Connection, SocketIOServerTransport, makeRegularHandler } from "@transport";
import { MessageSender, Transport } from "@transport";

export interface CoreDependencies {
    transport: Transport,
    connection: Connection,
    userManager: UserManager,
    messageSender: MessageSender
}

export class Bootstrapper {
    private facadeFactory: HttpFacadeFactory;
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[] = [];
    private userStorage: UserStorage;
    private options: InstanceOptions = {
        port: 8080
    };

    private coreDependencies: CoreDependencies = {} as any;

    constructor() {
        this.pipeline = new DefaulMessagePipeline();
    }

    private buildCoreDependencies() {
        let transport = new SocketIOServerTransport(this.facadeFactory.create());
        let userManager = new DefaultUserManager();
        let connection = new Connection(transport);
        let messageSender = new MessageSender(transport);

        this.coreDependencies = {
            transport,
            connection,
            userManager,
            messageSender
        }
    }
    
    build(): Instance {
        this.buildCoreDependencies();

        let server = new Server(
            this.coreDependencies.connection,
            this.coreDependencies.userManager,
            this.coreDependencies.messageSender,
            this.pipeline.build(),
            new AuthModule(this.coreDependencies.userManager, this.authMethods, this.userStorage));

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

    add(factory: (core: CoreDependencies) => MessageHandler[]): this {
        return this.pipeline.chain(() => factory(this.coreDependencies)) && this;
    }
}