import { ClientConnectionHandler, Client } from "@client";
import { KeyInvitationMessage } from "./KeyInvitationMessage";
import { SessionJoiningResult } from "@session/SessionMessage";
import { CreateInviteMessage } from "./InviteMessage";

export class KeyInvitationClient implements Client {
    handler: ClientConnectionHandler;

    acceptInvite(invitationKey: string): Promise<SessionJoiningResult> {
        return this.handler.invokeWithMessage<KeyInvitationMessage>({
            invitationKey
        });
    }

    createInvite(sessionId: string, attempts?: number, expires?: Date, userIds?: string[])
        : Promise<{ success: boolean }> {
        return this.handler.invokeWithMessage<CreateInviteMessage>({
            inviteToSession: sessionId,
            attemptsCount: attempts || Infinity,
            expires,
            userIds
        });
    }
}