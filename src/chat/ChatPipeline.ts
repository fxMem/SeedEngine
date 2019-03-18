import { SpecificMessageTypeHandler, Message, MessageContext, ServerError } from "@transport";
import { isChatMessage } from "./ChatMessage";
import { ChatManager } from "./ChatManager";
import { OperationResult, Success } from "@core";
import { Users } from "@users";
import { Groups } from "@groups";

export class ChatPipeline implements SpecificMessageTypeHandler {

    name: 'chatPipeline';
    constructor(private chatManager: ChatManager, private users: Users, private groups: Groups) {

    }

    canHandle(message: Message): boolean {
        return isChatMessage(message);
    }

    handle(context: MessageContext): Promise<OperationResult> {
        let { message, from } = context;

        if (!isChatMessage(message)) {
            throw new ServerError('Incorrect message type for ChatPipeline!');
        }

        if (message.targetUer) {
            this.chatManager.sendToUser(from, this.users.getUserByNickname(message.targetUer), message.text);
        }
        else if (message.targetGroup) {
            this.chatManager.sendToGroup(from, this.groups.getGroup(message.targetGroup), message.text);
        }

        return Promise.resolve(Success);
    }
}