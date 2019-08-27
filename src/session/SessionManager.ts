import { SessionHandler } from "./Session";
import { SessionInfo } from "./SessionInfo";
import { User } from "../users/User";

export interface SessionManager {
    createSession(options: { owner: User, description?: string, isPrivate?: boolean }): SessionHandler;

    getSession(sessionId: string): SessionHandler;

    listAllSessions(user: User): SessionInfo[];
}