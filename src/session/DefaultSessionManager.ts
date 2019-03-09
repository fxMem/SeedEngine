import { SessionManager } from "./SessionManager";
import { User, Claims } from "@users";
import { SessionHandler } from "./Session";
import { DefaultSession } from "./DefaultSession";
import { ServerError } from "@transport";
import { SessionInfo } from "./SessionInfo";
import { createLocalLogScope } from "@log";


export class DefaultSessionManager implements SessionManager {

    private log = createLocalLogScope(nameof(DefaultSessionManager));
    private sessionIdCounter = 0;
    private sessions = new Map<string, DefaultSession>();

    getSession(sessionId: string): DefaultSession {
        return this.sessions.get(sessionId);
    }

    listAllSessions(user: User): SessionInfo[] {
        if (!user.haveClaim(Claims.viewSessionList)) {
            throw new ServerError(`User ${user} does not have sufficient rights to create sessions!`);
        }
        let result: SessionInfo[] = [];
        for (let session of (this.sessions.values as any)) {
            result.push(session);
        }

        return result;
    }

    createSession(options: { owner: User, description?: string }): SessionHandler {
        let { owner, description } = options;
        if (!owner.haveClaim(Claims.createSession)) {
            throw new ServerError(`User ${owner} does not have sufficient rights to create sessions!`);
        }

        let sessionId = this.sessionIdCounter++ + '';
        let session = new DefaultSession(sessionId, description);
        this.sessions.set(sessionId, session);

        this.log.info(`Created session ${sessionId} by ${owner}`);
        return session;
    }

}