export interface CreateInviteMessage {
    inviteToSession: string,
    expires: Date,
    attemptsCount: number;
    userIds: string[];
}

export function isCreateInviteMessage(message: any): message is CreateInviteMessage {
    return message.inviteToSession !== undefined;
}