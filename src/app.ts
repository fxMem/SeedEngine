import { Bootstrapper, Instance, CoreDependencies } from "@core";
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
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()))
        .add(_ => createSessionRelatedHandlers(_))

    return bootstrapper.build();

    function createSessionRelatedHandlers(_: CoreDependencies): MessageHandler[] {
        let sessionManager = new DefaultSessionManager(_.messageSender);

        let sessionPipeline = makeRegularHandler(new SessionPipeline(sessionManager));
        sessionPipeline.handlerName = 'SessionHandler';

        let lobbyModule = new VoteLobbyModule();
        let lobbyPipeline = makeRegularHandler(new LobbyPipeline(lobbyModule, sessionManager));
        lobbyPipeline.handlerName = 'LobbyHandler';

        let invitesManager = new InvitationManager(sessionManager);
        let inviteMethod = new KeyInvitationMethod(invitesManager);
        let invitesPipeline = makeRegularHandler(new InvitesPipeline([inviteMethod], invitesManager));
        invitesPipeline.handlerName = 'InvitesHandler';

        return [sessionPipeline, lobbyPipeline, invitesPipeline];
    }
}

let instance = buildTestServer();
instance.start();