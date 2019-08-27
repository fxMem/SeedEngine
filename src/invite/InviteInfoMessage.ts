import { Message } from "../transport/Message";

export interface InviteInfoMessage extends Message {
    getInfoForInviteKey: string;
}

export function isInviteInfoMessage(message: any): message is InviteInfoMessage {
    return message.getInfoForInviteKey !== undefined;
}