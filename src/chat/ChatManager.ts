import { User, Claims } from "@users";
import { createLocalLogScope } from "@log";
import { MessageSender, ServerError } from "@transport";

export const chatMessageClientHeader = 'chat';
export class ChatManager {

    private log = createLocalLogScope(nameof(ChatManager));
    constructor(private messageSender: MessageSender) {

    }

    sendMessage(from: User, target: string, text: string): void {

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