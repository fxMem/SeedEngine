import { isLobbyMessage } from "./LobbyMessage";
import { SpecificMessageTypeHandler } from "../transport/SpecificMessageTypeHandler";
import { LobbyModule } from "./LobbyModule";
import { SessionManager } from "../session/SessionManager";
import { MessageContext } from "../transport/MessagePipeline";
import { ServerError } from "../transport/ServerError";

export class LobbyPipeline implements SpecificMessageTypeHandler {

    name = 'LobbyHandler';
    constructor(private module: LobbyModule, private sessionManager: SessionManager) {

    }


    canHandle({ message }: MessageContext): boolean {
        return message && isLobbyMessage(message) && this.module.isModuleCommand(message);
    }

    handle(context: MessageContext): Promise<any> {
        let { message, from } = context;

        if (!isLobbyMessage(message)) {
            throw new ServerError(`Message ${JSON.stringify(message)} is not lobby message!`);
        }

        let { sessionId } = message;
        let session = this.sessionManager.getSession(sessionId);
        if (!session) {
            throw new ServerError(`Session with id ${sessionId} does not exist!`);
        }

        if (!session.players().find(u => u.nickname === from.nickname)) {
            throw new ServerError(`Player ${from} doesn't belong to session ${session} therefor cannot participate in lobby activities!`);
        }

        return this.module.handle({
            message,
            from,
            session,
            sender: context.sender
        });
    }


}