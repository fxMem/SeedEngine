import { SessionManager } from "./SessionManager";
import { User, Claims } from "@users";
import { SessionHandler } from "./Session";
import { DefaultSession } from "./DefaultSession";
import { ServerError, MessageSender } from "@transport";
import { SessionInfo } from "./SessionInfo";
import { createLocalLogScope } from "@log";
import { GroupManager } from "@groups";


export class DefaultSessionManager implements SessionManager {

    private log = createLocalLogScope(nameof(DefaultSessionManager));
    private sessionIdCounter = 0;
    private sessions = new Map<string, DefaultSession>();

    constructor(private messageSender: MessageSender, private groupsManager: GroupManager) {

    }

    getSession(sessionId: string): DefaultSession {
        return this.sessions.get(sessionId);
    }

    listAllSessions(user: User): SessionInfo[] {
        if (!user.haveClaim(Claims.viewSessionList)) {
            throw new ServerError(`User ${user} does not have sufficient rights to create sessions!`);
        }
        let result: SessionInfo[] = [];
        return [...(this.sessions as any).values()].map((s: DefaultSession) => s.getInfo());
    }

    createSession(options: { owner: User, description?: string }): SessionHandler {
        let { owner, description } = options;
        if (!owner.haveClaim(Claims.createSession)) {
            throw new ServerError(`User ${owner} does not have sufficient rights to create sessions!`);
        }

        let sessionId = this.sessionIdCounter++ + '';
        let sessionGroup = this.groupsManager.createGroup(owner, null, `Group for session ${sessionId}`);
        let session = new DefaultSession(sessionGroup, this.messageSender, sessionId, description);
        this.sessions.set(sessionId, session);

        this.log.info(`Created session ${sessionId} by ${owner}`);
        return session;
    }

}