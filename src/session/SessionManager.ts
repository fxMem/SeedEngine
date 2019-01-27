import { Session } from "@session";
import { User } from "@core";

export interface SessionManager {
    createSession(options: { owner: User }): Session;
}