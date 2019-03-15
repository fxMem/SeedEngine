import { Message } from "@transport";
import { nickname } from "@users";


export interface ChatMessage extends Message {
    text: string;
    target: string;
}

export function isChatMessage(message: any): message is ChatMessage {
    return message.text !== undefined && message.target !== undefined;
}

// Sent to client
export interface ChatPayload {
    from: nickname;
    text: string;
}