import { SessionManager } from "./SessionManager";
import { User, Claims } from "@users";
import { InternalSession } from "./Session";
import { DefaultSession } from "./DefaultSession";
import { ServerError } from "@transport";
import { SessionInfo } from "./SessionInfo";


export class DefaultSessionManager implements SessionManager {

    private sessionIdCounter = 0;
    private sessions = new Map<string, DefaultSession>();

    getSession(sessionId: string): DefaultSession {
        return this.sessions.get(sessionId);
    }

    listAllSessions(): SessionInfo[] {
        let result: SessionInfo[] = [];
        for (let session of (this.sessions.values as any)) {
            result.push(session);
        }

        return result;
    }

    createSession(options: { owner: User, description?: string }): InternalSession {
        let { owner, description } = options;
        if (!owner.haveClaim(Claims.createSession)) {
            throw new ServerError(`User ${owner.nickname} does not have sufficient rights to create sessions!`);
        }

        let sessionId = this.sessionIdCounter++ + '';
        let session = new DefaultSession(sessionId, description);
        this.sessions.set(sessionId, session);

        return session;
    }

}