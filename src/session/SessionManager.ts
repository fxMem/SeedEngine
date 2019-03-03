import { User } from "@users";
import { Session, SessionInfo } from "./Session";

export interface SessionManager {
    createSession(options: { owner: User, description?: string }): Session;

    getSession(sessionId: string): Session;

    listAllSessions(): SessionInfo[];
}