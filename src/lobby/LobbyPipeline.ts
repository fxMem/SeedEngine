import { SpecificMessageTypeHandler, Message, MessageContext, ServerError } from "@transport";
import { createLocalLogScope } from "@log";
import { LobbyModule } from "./LobbyModule";
import { SessionManager } from "@session";
import { LobbyMessage } from "./LobbyMessage";


function isLobbyMessage(message: Message): message is LobbyMessage {
    return (message as any).sessionId !== undefined;
}

export class LobbyPipeline implements SpecificMessageTypeHandler {
    private log = createLocalLogScope(nameof(LobbyPipeline));

    constructor(private module: LobbyModule, private sessionManager: SessionManager) {

    }


    canHandle(message: Message): boolean {
        return isLobbyMessage(message) && this.module.isModuleCommand(message);
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

        return this.module.handle({
            message,
            from,
            session
        });
    }


}