import { Bootstrapper, Instance } from "@core";
import { InMemoryUserStorage, SimpleIdentity } from "@users";
import { ExpressFacadeFactory, makeRegularHandler, MessageHandler } from "@transport";
import { DefaultSessionPipeline, DefaultSessionManager } from "@session";
import { initializeLogger, DefaultConsoleLogger, Log } from "@log";

function buildTestServer(): Instance {

    initializeLogger(new Log([new DefaultConsoleLogger()]));

    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()))
        .add(createSessionHandler());

    function createSessionHandler(): MessageHandler {
        let handler = makeRegularHandler(new DefaultSessionPipeline(new DefaultSessionManager()));
        handler.handlerName = 'SessionHandler';

        return handler;
    }
    return bootstrapper.build();
}

let instance = buildTestServer();
instance.start();