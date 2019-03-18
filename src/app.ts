import { Bootstrapper, Instance, CoreDependencies } from "@core";
import { InMemoryUserStorage, SimpleIdentity } from "@users";
import { ExpressFacadeFactory, makeRegularHandler, MessageHandler } from "@transport";
import { SessionPipeline, DefaultSessionManager } from "@session";
import { initializeLogger, DefaultConsoleLogger, Log } from "@log";
import { LobbyPipeline, VoteLobbyModule } from "@lobby";
import { KeyInvitationMethod, InvitesPipeline, InvitationManager } from "@invite";
import { GroupPipeline } from "@groups";
import { ChatPipeline, ChatManager } from "@chat";

function buildTestServer(): Instance {

    initializeLogger(new Log([new DefaultConsoleLogger()]));

    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()))
        .add(_ => createSessionRelatedHandlers(_))
        .add(_ => createGroupsHandler(_))
        .add(_ => createChatHandler(_));

    return bootstrapper.build();

    function createGroupsHandler(_: CoreDependencies): MessageHandler[] {
        let groupHandler = makeRegularHandler(new GroupPipeline(_.groups));

        return [groupHandler];
    }

    function createChatHandler(_: CoreDependencies): MessageHandler[] {
        let chatManager = new ChatManager(_.messageSender);
        let chatHandler = makeRegularHandler(new ChatPipeline(chatManager, _.users, _.groups));

        return [chatHandler];
    }

    function createSessionRelatedHandlers(_: CoreDependencies): MessageHandler[] {
        let sessionManager = new DefaultSessionManager(_.messageSender, _.groups);

        let sessionPipeline = makeRegularHandler(new SessionPipeline(sessionManager));

        let lobbyModule = new VoteLobbyModule();
        let lobbyPipeline = makeRegularHandler(new LobbyPipeline(lobbyModule, sessionManager));

        let invitesManager = new InvitationManager(sessionManager);
        let inviteMethod = new KeyInvitationMethod(invitesManager);
        let invitesPipeline = makeRegularHandler(new InvitesPipeline([inviteMethod], invitesManager));

        return [sessionPipeline, lobbyPipeline, invitesPipeline];
    }
}

let instance = buildTestServer();
instance.start();