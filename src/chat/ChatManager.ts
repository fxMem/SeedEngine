import { User, Claims } from "@users";
import { createLocalLogScope } from "@log";
import { MessageSender, ServerError } from "@transport";
import { MessageTarget } from "@transport/MessageTarget";
import { Group } from "@groups";

export const chatMessageClientHeader = 'chat';
export class ChatManager {

    private log = createLocalLogScope(nameof(ChatManager));
    constructor(private messageSender: MessageSender) {

    }

    sendToUser(from: User, to: User, text: string): void {
        this.sendMessage(from, MessageTarget.fromUser(to), text);
    }

    sendToGroup(from: User, to: Group, text: string): void {
        this.sendMessage(from, MessageTarget.fromGroup(to), text);
    }

    sendMessage(from: User, target: MessageTarget, text: string): void {

        if (!from.haveClaim(Claims.sendChatMessage)) {
            throw new ServerError(`User ${from} cannot send chat messages!`);
        }

        this.log.info(`Sending message from ${from} to ${target}, contents = '${text}'`);
        
        this.messageSender.send({
            header: chatMessageClientHeader, 
            payload: {
                text,
                from: from.nickname
            }
        })
        .to(target)
        .go();
    }
}