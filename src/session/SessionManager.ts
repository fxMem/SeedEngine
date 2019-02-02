import { User } from "@users";
import { Session } from "./Session";

export interface SessionManager {
    createSession(options: { owner: User }): Session;
}