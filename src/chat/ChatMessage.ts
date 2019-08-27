import { Message } from "../transport/Message";
import { nickname } from "../users/User";

export interface ChatMessage extends Message {
    text: string;
    targetUer?: string;
    targetGroup?: string;
}

export function isChatMessage(message: any): message is ChatMessage {
    return message.text !== undefined && (message.targetUer !== undefined || message.targetGroup !== undefined);
}

// Sent to client
export interface ChatPayload {
    from: nickname;
    text: string;
}