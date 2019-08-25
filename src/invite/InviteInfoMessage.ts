export interface InviteInfoMessage {
    getInfoForInviteKey: string;
}

export function isInviteInfoMessage(message: any): message is InviteInfoMessage {
    return message.getInfoForInviteKey !== undefined;
}