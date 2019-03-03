import { Instance, DefaultInstance, InstanceOptions } from "./Instance";
import { DefaultUserManager, AuthMethod, AuthModule, UserStorage } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler, HttpFacadeFactory, Connection, SocketIOServerTransport, SpecificMessageTypeHandler } from "@transport";
import { Logger, Log, DefaultConsoleLogger } from "@log";
import { MessageSender } from "@transport/MessageSender";
import { log } from "util";


export class Bootstrapper {
    private facadeFactory: HttpFacadeFactory;
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[] = [];
    private userStorage: UserStorage;
    private loggers: Logger[];
    private options: InstanceOptions = {
        port: 8080
    };

    constructor() {
        this.pipeline = new DefaulMessagePipeline();
    }

    build(): Instance {
        let log = new Log(this.loggers || [new DefaultConsoleLogger()]);
        let serverTransport = new SocketIOServerTransport(this.facadeFactory.create(log));

        let userManager = new DefaultUserManager();
        let connection = new Connection(serverTransport);
        let messageSender = new MessageSender(serverTransport);

        let server = new Server(
            connection,
            userManager,
            messageSender,
            this.pipeline.build(log),
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