import { Message } from "../transport/Message";

export interface KeyInvitationMessage extends Message {
    invitationKey: string;
}

export function isKeyInvitationMessage(message: any): message is KeyInvitationMessage {
    return message.invitationKey !== undefined;
}