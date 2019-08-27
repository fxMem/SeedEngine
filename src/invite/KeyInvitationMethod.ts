import { InvitationMethod } from "./InvitationMethod";
import { isKeyInvitationMessage } from "./KeyInvitationMessage";
import { InvitationManager } from "./InvitationManager";
import { User } from "../users/User";
import { OperationResult } from "../core/OperationResult";
import { ServerError } from "../transport/ServerError";

export class KeyInvitationMethod implements InvitationMethod {

    constructor(private inviteManager: InvitationManager) {

    }

    isCorrectInvitation(message: any): boolean {
        return isKeyInvitationMessage(message);
    }    
    
    processInvite(message: any, from: User): Promise<OperationResult> {
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