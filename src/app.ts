import { Bootstrapper, Instance } from "@core";
import { SimpleIdentityChecker, SimpleAuthModule, InMemoryUserStorage } from "@users";
import { ExpressFacadeFactory } from "@transport";

function buildTestServer(): Instance {
    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleAuthModule(new SimpleIdentityChecker()))
        .withStorage(new InMemoryUserStorage());

    return bootstrapper.build();
}

let instance = buildTestServer();
instance.start();