import { SpecificMessageTypeHandler, Message, MessageContext } from "@transport";

export enum SessionCommand {
    create,
    join,
    leave
}

export interface SessionMessage extends Message {
    command: SessionCommand;
}

function isSessionMessage(message: Message): message is SessionMessage {
    return (message as any).command;
}

export class SessionPipeline implements SpecificMessageTypeHandler {
    canHandle(message: Message): boolean {
        return isSessionMessage(message);
    }

    handle(context: MessageContext): Promise<any> {
        let { message } = context;
        
        if (!isSessionMessage(message)) {
            throw new Error();
        }

        return Promise.resolve();
    }
}