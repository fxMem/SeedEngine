import { Instance, DefaultInstance, InstanceOptions } from "./Instance";
import { DefaultUserManager, AuthMethod, AuthModule, UserStorage } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler, HttpFacadeFactory, Connection, SocketIOServerTransport } from "@transport";
import { Logger, Log, DefaultConsoleLogger } from "@log";


export class Bootstrapper {
    private facadeFactory: HttpFacadeFactory;
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[] = [];
    private userStorage: UserStorage;
    private loggers: Logger[];
    private options: InstanceOptions = {
        port: 8181
    };

    build(): Instance {
        this.pipeline = new DefaulMessagePipeline();

        let userManager = new DefaultUserManager(this.userStorage);
        let log = new Log(this.loggers || [new DefaultConsoleLogger()]);

        let serverTransport = new SocketIOServerTransport(this.facadeFactory.create(log));
        let connection = new Connection(serverTransport);

        let server = new Server(
            connection,
            this.pipeline.build(),
            new AuthModule(userManager, this.authMethods, this.userStorage, log),
            log);

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

    withLogger(logger: Logger): this {
        return this.loggers.push(logger) && this;
    }

    add(handler: MessageHandler): this {
        return this.pipeline.chain(handler) && this;
    }
}