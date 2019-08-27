import { KeyInvitationMessage } from "./KeyInvitationMessage";
import { CreateInviteMessage } from "./InviteMessage";
import { InviteInfo } from "./InviteInfo";
import { InviteInfoMessage } from "./InviteInfoMessage";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { OperationResult } from "../core/OperationResult";

export class KeyInvitationClient implements Client {
    handler: ClientConnectionHandler;

    getInviteInfo(getInfoForInviteKey: string): Promise<InviteInfo> {
        return this.handler.invokeWithMessage<InviteInfoMessage>({
            getInfoForInviteKey
        });
    }

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