import { SessionManager } from "./SessionManager";
import { User } from "@users";
import { Session } from "./Session";
import { DefaultSession } from "./DefaultSession";

export class DefaultSessionManager implements SessionManager {

    private sessionIdCounter = 0;
    private sessions = new Map<string, DefaultSession>();

    getSession(sessionId: string): DefaultSession {
        return this.sessions.get(sessionId);
    }

    createSession(options: { owner: User }): Session {
        let sessionId = this.sessionIdCounter++ + '';
        let session = new DefaultSession(sessionId);
        this.sessions.set(sessionId, session);

        return session;
    }

}