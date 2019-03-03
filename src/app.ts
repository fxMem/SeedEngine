import { Bootstrapper, Instance } from "@core";
import { InMemoryUserStorage, SimpleIdentity } from "@users";
import { ExpressFacadeFactory, makeRegularHandler } from "@transport";
import { SessionPipeline, DefaultSessionManager } from "@session";

function buildTestServer(): Instance {
    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()))
        .add(makeRegularHandler(new SessionPipeline(new DefaultSessionManager())));

    return bootstrapper.build();
}

let instance = buildTestServer();
instance.start();