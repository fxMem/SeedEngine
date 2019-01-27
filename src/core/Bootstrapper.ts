import { Instance, DefaultInstance } from "./Instance";
import { SimpleAuthModule, SimpleIdentityChecker, IdentityChecker, AuthMethod, AuthModule, UserStorage, InMemoryUserStorage } from "@users";
import { Server, MessagePipeline, DefaulMessagePipeline, MessageHandler } from "@transport";
import { DefaultUserManager } from "users/UserManager";

export class Bootstrapper {
    private pipeline: MessagePipeline;
    private authMethods: AuthMethod[];
    private userStorage: UserStorage;

    build(): Instance {
        this.pipeline = new DefaulMessagePipeline();
        this.withAuthMethod(new SimpleAuthModule(new SimpleIdentityChecker()))
        this.withStorage(new InMemoryUserStorage());

        let userManager = new DefaultUserManager(this.userStorage);
        let server = new Server(
            this.pipeline.build(), 
            new AuthModule(userManager, this.authMethods, this.userStorage));

        return new DefaultInstance(server);
    }

    withAuthMethod(method: AuthMethod): Bootstrapper {
        this.authMethods.push(method);
        return this;
    }

    withStorage(storage: UserStorage): Bootstrapper {
        this.userStorage = storage;
        return this;
    }

    add(handler: MessageHandler): Bootstrapper {
        this.pipeline.chain(handler);
        return this;
    }
}