import { Instance, Bootstrapper, CoreDependencies } from '../core';

import { initializeLogger, Log, DefaultConsoleLogger } from '../log';

import { ExpressFacadeFactory, MessageHandler, makeRegularHandler } from '../transport';

import { SimpleIdentity, InMemoryUserStorage } from '../users';

import { GroupPipeline } from '../groups';

import { ChatManager, ChatPipeline } from '../chat';

import { DefaultSessionManager, SessionPipeline } from '../session';

import { VoteLobbyModule, LobbyPipeline } from '../lobby';

import { InvitationManager, KeyInvitationMethod, InvitesPipeline } from '../invite';

export * from '../session';
export * from '../transport';
export * from '../users';
export * from '../groups';
export * from '../game';
export * from '../invite';
export * from '../chat';
export * from '../lobby';
export * from '../log';
export * from '../core';

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