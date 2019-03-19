import { Session } from "../session";

export interface Game {

    // Returns callback which is invoked when forcefull shutdown is requested
    create(session: Session): () => void;
}