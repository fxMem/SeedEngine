import { Session } from "@session";

export interface Game {
    create(session: Session): void;
}