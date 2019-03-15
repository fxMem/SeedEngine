import { User } from "@users";
import { createLocalLogScope } from "@log";
import { MessageSender } from "@transport";

export const chatMessageClientHeader = 'chat';
export class ChatManager {

    private log = createLocalLogScope(nameof(ChatManager));
    constructor(private messageSender: MessageSender) {

    }

    sendMessage(from: User, target: string, text: string): void {
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