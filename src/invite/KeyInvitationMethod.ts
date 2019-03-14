import { InvitationMethod } from "./InvitationMethod";
import { isKeyInvitationMessage } from "./KeyInvitationMessage";
import { ServerError } from "@transport";
import { User } from "@users";
import { InvitationManager } from "./InvitationManager";
import { SessionJoiningResult } from "@session/SessionMessage";

export class KeyInvitationMethod implements InvitationMethod {

    constructor(private inviteManager: InvitationManager) {

    }

    isCorrectInvitation(message: any): boolean {
        return isKeyInvitationMessage(message);
    }    
    
    processInvite(message: any, from: User): Promise<SessionJoiningResult> {
        if (!isKeyInvitationMessage(message)) {
            throw new ServerError(`Message ${JSON.stringify(message)} is not correct KeyInvitation message!`);
        }

        let key = message.invitationKey;
        let invite = this.inviteManager.getInvite(key);
        if (!invite) {
            throw new ServerError(`Invite with key ${key} not found!` );
        }

        return this.inviteManager.useInvite(invite, from);
    }
}