import { Bootstrapper, Instance } from "@core";
import { SimpleIdentityChecker, SimpleAuthModule, InMemoryUserStorage } from "@users";

function buildTestServer(): Instance {
    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withAuthMethod(new SimpleAuthModule(new SimpleIdentityChecker()))
        .withStorage(new InMemoryUserStorage());

    return bootstrapper.build();
}

let instance = buildTestServer();
instance.start();