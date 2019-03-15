import { SpecificMessageTypeHandler, Message, MessageContext, ServerError } from "@transport";
import { isChatMessage } from "./ChatMessage";
import { ChatManager } from "./ChatManager";
import { OperationResult, Success } from "@core";

export class ChatPipeline implements SpecificMessageTypeHandler {

    name: 'chatPipeline';
    constructor(private chatManager: ChatManager) {

    }

    canHandle(message: Message): boolean {
        return isChatMessage(message);
    }

    handle(context: MessageContext): Promise<OperationResult> {
        let { message, from } = context;

        if (!isChatMessage(message)) {
            throw new ServerError('Incorrect message type for ChatPipeline!');
        }

        this.chatManager.sendMessage(from, message.target, message.text);
        return Promise.resolve(Success);
    }
}