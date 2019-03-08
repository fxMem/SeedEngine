import { User } from "@users";
import { InternalSession } from "./Session";
import { SessionInfo } from "./SessionInfo";

export interface SessionManager {
    createSession(options: { owner: User, description?: string }): InternalSession;

    getSession(sessionId: string): InternalSession;

    listAllSessions(user: User): SessionInfo[];
}