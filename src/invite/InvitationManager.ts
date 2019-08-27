import { Invite } from "./Invite";
import { InviteInfo } from "./InviteInfo";
import { createLocalLogScope } from "../log/LoggerScopes";
import { SessionManager } from "../session/SessionManager";
import { User } from "../users/User";
import { Claims } from "../users/Claims";
import { DeniedError, ServerError } from "../transport/ServerError";
import { OperationResult } from "../core/OperationResult";

export class InvitationManager {

    private log = createLocalLogScope(nameof(InvitationManager));

    // TODO: remove expired invites
    private invites = new Map<string, Invite>();

    constructor(private sessionManager: SessionManager) {

    }

    addInvite(invite: Invite, from: User): void {
        if (!from.haveClaim(Claims.createInvite)) {
            throw new DeniedError(`User ${from} doesn't have sufficient rights to create invites!`);
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

    getInviteInfo(key: string): InviteInfo {
        const invite = this.invites.get(key);
        if (!invite) {
            throw new ServerError(`Invite with id ${key} not found!`);
        }

        const session = this.sessionManager.getSession(invite.sessionId);
        if (!session) {
            throw new ServerError(`Requested invite info for non excisting or removed session, sessionId = ${invite.sessionId}, inviteId = ${invite.id}`)
        }

        const sessionInfo = session.info;

        return {
            sessionId: invite.sessionId,
            sessionDescription: sessionInfo.description,
            note: invite.note,
            invitedBy: invite.from.nickname
        }
    }

    useInvite(invite: Invite, user: User): Promise<OperationResult> {
        if (!invite.isValid({ user, requestedTime: new Date() })) {
            throw new ServerError(`Invite ${invite} cannot be used for user ${user}`);
        }

        if (!user.haveClaim(Claims.joinInvite)) {
            throw new DeniedError(`User ${user} doesn't have rights to join invites!`);
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