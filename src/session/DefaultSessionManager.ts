import { SessionManager } from "./SessionManager";
import { createLocalLogScope } from "../log";
import { DefaultSession, SessionHandler } from ".";
import { MessageSender, ServerError, DeniedError } from "../server";
import { GroupManager } from "../groups";
import { Game } from "../game";
import { User, Claims } from "../users";
import { SessionInfo } from "./SessionInfo";

export class DefaultSessionManager implements SessionManager {

    private log = createLocalLogScope(nameof(DefaultSessionManager));
    private sessionIdCounter = 0;
    private sessions = new Map<string, DefaultSession>();

    constructor(
        private messageSender: MessageSender, 
        private groupsManager: GroupManager,
        private game: Game) {

    }

    getSession(sessionId: string): DefaultSession {
        // TODO: should we add here simular claim for viewing individual sessions?
        // Or maybe just remove 'view claims' altogether?

        return this.sessions.get(sessionId);
    }

    listAllSessions(user: User): SessionInfo[] {
        if (!user.haveClaim(Claims.viewSessionList)) {
            throw new DeniedError(`User ${user} does not have sufficient rights to view sessions list!`);
        }
        
        return Array.from((this.sessions as any).values()).map((s: DefaultSession) => s.getInfo());
    }

    createSession(options: { owner: User, description?: string }): SessionHandler {
        let { owner, description } = options;
        if (!owner.haveClaim(Claims.createSession)) {
            throw new DeniedError(`User ${owner} does not have sufficient rights to create sessions!`);
        }

        let sessionId = this.sessionIdCounter++ + '';
        let sessionGroup = this.groupsManager.createGroup(owner, null, `Group for session ${sessionId}`);
        let session = new DefaultSession(sessionGroup, this.messageSender, sessionId, description);

        if (this.game) {
            // should we populate fresh object here instead of passing the whole session?
            let finishedCallback = this.game.create(session);
            session.setFinishedCallback(() => {
                finishedCallback();
                this.sessions.delete(sessionId);
            });
        }
        
        this.sessions.set(sessionId, session);

        this.log.info(`Created session ${sessionId} by ${owner}`);
        return session;
    }

}