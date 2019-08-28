import { MessageTarget } from "../transport/MessageTarget";
import { createLocalLogScope } from "../log/LoggerScopes";
import { MessageSender } from "../transport/MessageSender";
import { User } from "../users/User";
import { Group } from "../groups/Group";
import { Claims } from "../users/Claims";
import { DeniedError } from "../transport/ServerError";


export const chatMessageClientHeader = 'chat';
export class ChatManager {

    private log = createLocalLogScope('ChatManager');
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
            throw new DeniedError(`User ${from} cannot send chat messages!`);
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