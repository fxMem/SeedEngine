import { Instance, DefaultInstance } from "./Instance";
import { SimpleAuthModule, SimpleIdentityChecker, IdentityChecker, AuthMethod, AuthModule, UserStorage, InMemoryUserStorage } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler } from "@transport";
import { DefaultUserManager } from "users/UserManager";
import { Logger, Log, DefaultConsoleLogger } from "@log";


export class Bootstrapper {
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[];
    private userStorage: UserStorage;
    private loggers: Logger[];

    build(): Instance {
        this.pipeline = new DefaulMessagePipeline();
        let userManager = new DefaultUserManager(this.userStorage);
        let log = new Log(this.loggers || [new DefaultConsoleLogger()]);

        let server = new Server(
            this.pipeline.build(),
            new AuthModule(userManager, this.authMethods, this.userStorage),
            log);

        return new DefaultInstance(server);
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