import { User, Claims } from "@users";
import { Invite } from "./Invite";
import { ServerError } from "@transport";
import { SessionManager } from "@session";

import { createLocalLogScope } from "@log";
import { OperationResult } from "@core";

export class InvitationManager {

    private log = createLocalLogScope(nameof(InvitationManager));

    // TODO: remove expired invites
    private invites = new Map<string, Invite>();

    constructor(private sessionManager: SessionManager) {

    }

    addInvite(invite: Invite, from: User): void {
        if (!from.haveClaim(Claims.createInvite)) {
            throw new ServerError(`User ${from} doesn't have sufficient rights to create invites!`);
        }

        if (this.invites.has(invite.id)) {
            throw new ServerError(`Invite with key ${invite.id} is already exists!`);
        }

        this.log.info(`User ${from} has added new invite ${invite}`);
        this.invites.set(invite.id, invite);
    }

    getInvite(key: string): Invite {
        return this.invites.get(key);
    }

    useInvite(invite: Invite, user: User): Promise<OperationResult> {
        if (!invite.isValid({ user, requestedTime: new Date() })) {
            throw new ServerError(`Invite ${invite} cannot be used for user ${user}`);
        }

        if (!user.haveClaim(Claims.joinInvite)) {
            throw new ServerError(`User ${user} doesn't have rights to join invites!`);
        }

        let session = this.sessionManager.getSession(invite.sessionId);
        if (!session) {
            throw new ServerError(`Session ${session.id()} for which invite ${invite} was issued does not exist anymore`);
        }

        let success = invite.take();
        if (!success) {
            throw new ServerError(`Couldn't accept invite ${invite}, all attempts were exhausted.`);
        }

        this.log.info(`Player ${user} has used invite ${invite}`);
        return session.addPlayer(user);
    }
}