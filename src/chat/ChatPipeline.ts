import { isChatMessage } from "./ChatMessage";
import { SpecificMessageTypeHandler } from "../transport/SpecificMessageTypeHandler";
import { ChatManager } from "./ChatManager";
import { Users } from "../users/Users";
import { Groups } from "../groups/GroupManager";
import { MessageContext } from "../transport/MessagePipeline";
import { OperationResult, Success } from "../core/OperationResult";
import { ServerError } from "../transport/ServerError";

export class ChatPipeline implements SpecificMessageTypeHandler {

    name = 'chatPipeline';
    constructor(private chatManager: ChatManager, private users: Users, private groups: Groups) {

    }

    canHandle({ message }: MessageContext): boolean {
        return message && isChatMessage(message);
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