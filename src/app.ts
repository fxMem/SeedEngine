import { Bootstrapper, Instance } from "@core";
import { InMemoryUserStorage, SimpleIdentity } from "@users";
import { ExpressFacadeFactory } from "@transport";

function buildTestServer(): Instance {
    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()));

    return bootstrapper.build();
}

let instance = buildTestServer();
instance.start();