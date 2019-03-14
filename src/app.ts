import { Bootstrapper, Instance } from "@core";
import { InMemoryUserStorage, SimpleIdentity } from "@users";
import { ExpressFacadeFactory, makeRegularHandler, MessageHandler } from "@transport";
import { SessionPipeline, DefaultSessionManager } from "@session";
import { initializeLogger, DefaultConsoleLogger, Log } from "@log";
import { LobbyPipeline, VoteLobbyModule } from "@lobby";
import { KeyInvitationMethod, InvitesPipeline } from "@invite";
import { InvitationManager } from "@invite/InvitationManager";

function buildTestServer(): Instance {

    initializeLogger(new Log([new DefaultConsoleLogger()]));

    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()));

    addSessionSupport(bootstrapper);
    return bootstrapper.build();

    function addSessionSupport(bootstrapper: Bootstrapper): Bootstrapper {
        let sessionManager = new DefaultSessionManager();

        let sessionPipeline = makeRegularHandler(new SessionPipeline(sessionManager));
        sessionPipeline.handlerName = 'SessionHandler';

        let lobbyModule = new VoteLobbyModule();
        let lobbyPipeline = makeRegularHandler(new LobbyPipeline(lobbyModule, sessionManager));
        lobbyPipeline.handlerName = 'LobbyHandler';

        let invitesManager = new InvitationManager(sessionManager);
        let inviteMethod = new KeyInvitationMethod(invitesManager);
        let invitesPipeline = makeRegularHandler(new InvitesPipeline([inviteMethod], invitesManager));
        invitesPipeline.handlerName = 'InvitesHandler';

        return bootstrapper
            .add(sessionPipeline)
            .add(lobbyPipeline)
            .add(invitesPipeline);
    }
}

let instance = buildTestServer();
instance.start();