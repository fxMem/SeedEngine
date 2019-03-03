import { User } from "@users";
import { Session } from "./Session";
import { SessionInfo } from "./SessionInfo";

export interface SessionManager {
    createSession(options: { owner: User, description?: string }): Session;

    getSession(sessionId: string): Session;

    listAllSessions(): SessionInfo[];
}