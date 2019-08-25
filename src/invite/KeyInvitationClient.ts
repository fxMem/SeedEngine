import { KeyInvitationMessage } from "./KeyInvitationMessage";
import { CreateInviteMessage } from "./InviteMessage";
import { Client, ClientConnectionHandler } from "../client";
import { OperationResult } from "../core";

export class KeyInvitationClient implements Client {
    handler: ClientConnectionHandler;

    acceptInvite(invitationKey: string): Promise<OperationResult> {
        return this.handler.invokeWithMessage<KeyInvitationMessage>({
            invitationKey
        });
    }

    createInvite(sessionId: string, attempts?: number, expires?: Date, note?: string, userIds?: string[])
        : Promise<{ success: boolean, inviteKey: string }> {
        return this.handler.invokeWithMessage<CreateInviteMessage>({
            inviteToSession: sessionId,
            attemptsCount: attempts || Infinity,
            expires,
            note,
            userIds
        });
    }
}