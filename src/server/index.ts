
import { MinerGameFactory } from '../miner/MinerGameFactory';
import { Instance } from '../core/Instance';
import { initializeLogger } from '../log/LoggerScopes';
import { Log, DefaultConsoleLogger } from '../log/Logger';
import { Bootstrapper, CoreDependencies } from '../core/Bootstrapper';
import { ExpressFacadeFactory } from '../transport/HttpFacade';
import { SimpleIdentity } from '../users/SimpleIdentity';
import { InMemoryUserStorage } from '../users/InMemoryUserStorage';
import { MessageHandler } from '../transport/MessagePipeline';
import { makeRegularHandler } from '../transport/SpecificMessageTypeHandler';
import { GroupPipeline } from '../groups/GroupPipeline';
import { ChatManager } from '../chat/ChatManager';
import { ChatPipeline } from '../chat/ChatPipeline';
import { DefaultSessionManager } from '../session/DefaultSessionManager';
import { SessionPipeline } from '../session/SessionPipeline';
import { VoteLobbyModule } from '../lobby/VoteLobbyModule';
import { LobbyPipeline } from '../lobby/LobbyPipeline';
import { InvitationManager } from '../invite/InvitationManager';
import { KeyInvitationMethod } from '../invite/KeyInvitationMethod';
import { InvitesPipeline } from '../invite/InvitesPipeline';

function buildTestServer(): Instance {

    initializeLogger(new Log([new DefaultConsoleLogger()]));

    let bootstrapper = new Bootstrapper();
    bootstrapper
        .withHttpFacade(new ExpressFacadeFactory())
        .withAuthMethod(new SimpleIdentity.SimpleAuthModule())
        .withStorage(SimpleIdentity.WithSuperUser(new InMemoryUserStorage()))
        .add(_ => createSessionRelatedHandlers(_))
        .add(_ => createGroupsHandler(_))
        .add(_ => createChatHandler(_))
        .withGame(new MinerGameFactory());

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
        let sessionManager = new DefaultSessionManager({ allowJoinAfterSessionStart: false }, _.messageSender, _.groups, _.game);

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