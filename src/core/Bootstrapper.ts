import { Instance, DefaultInstance, InstanceOptions } from "./Instance";
import { DefaultUserManager, AuthMethod, AuthModule, UserStorage, UserManager } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler, HttpFacadeFactory, Connection, SocketIOServerTransport, makeRegularHandler } from "@transport";
import { MessageSender, Transport } from "@transport";
import { GroupManager } from "@groups";
import { GroupIdGenerator } from "@groups/GroupIdGenerator";
import { InMemoryGroupIdGenerator } from "@groups/InMemoryGroupIdGenerator";
import { Game } from "@game";

export interface CoreDependencies {
    transport: Transport,
    connection: Connection,
    users: UserManager,
    messageSender: MessageSender,
    groups: GroupManager,
    game: Game
}

export class Bootstrapper {
    private facadeFactory: HttpFacadeFactory;
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[] = [];
    private userStorage: UserStorage;
    private groupIdGenerator: GroupIdGenerator;
    private game: Game;
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
        let groups = new GroupManager(userManager, this.groupIdGenerator || new InMemoryGroupIdGenerator());

        this.coreDependencies = {
            transport,
            connection,
            users: userManager,
            messageSender,
            groups, 
            game: this.game
        }
    }
    
    build(): Instance {
        this.buildCoreDependencies();

        let server = new Server(
            this.coreDependencies.connection,
            this.coreDependencies.users,
            this.coreDependencies.messageSender,
            this.pipeline.build(),
            new AuthModule(this.coreDependencies.users, this.authMethods, this.userStorage));

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

    withGroupIdGenerator(generator: GroupIdGenerator): this {
        return (this.groupIdGenerator = generator) && this;
    }

    add(factory: (core: CoreDependencies) => MessageHandler[]): this {
        return this.pipeline.chain(() => factory(this.coreDependencies)) && this;
    }

    withGame(game: Game): this {
        return (this.game = game) && this;
    }
}