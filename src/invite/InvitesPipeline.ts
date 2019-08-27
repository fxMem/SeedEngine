import { InvitationMethod } from "./InvitationMethod";
import { isCreateInviteMessage, CreateInviteMessage } from "./InviteMessage";
import { InviteBuilder } from "./Invite";
import { InvitationManager } from "./InvitationManager";
import { isInviteInfoMessage } from "./InviteInfoMessage";
import { SpecificMessageTypeHandler } from "../transport/SpecificMessageTypeHandler";
import { MessageContext } from "../transport/MessagePipeline";
import { User } from "../users/User";
import { Users } from "../users/Users";

export class InvitesPipeline implements SpecificMessageTypeHandler {

    name: 'invitesHander';
    constructor(private methods: InvitationMethod[], private inviteManager: InvitationManager) {

    }

    canHandle({ message }: MessageContext): boolean {
        return message && (isCreateInviteMessage(message) || this.methods.some(m => m.isCorrectInvitation(message)));
    }

    async handle(context: MessageContext): Promise<any> {

        let { message, from, users } = context;
        if (isCreateInviteMessage(message)) {
            return this.createInvite(message, from, users);
        }
        else if (isInviteInfoMessage(message)) {
            return this.inviteManager.getInviteInfo(message.getInfoForInviteKey);
        }

        let method = this.methods.filter(m => m.isCorrectInvitation(message))[0];
        return method.processInvite(message, from);
    }

    private createInvite(message: CreateInviteMessage, from: User, users: Users): { success: boolean, inviteKey: string } {
        let invite = InviteBuilder
            .forSession(message.inviteToSession, from)
            .validUntil(message.expires)
            .withUseCount(message.attemptsCount)
            .forUsers((message.userIds || []).map(u => users.getUserById(u)))
            .build();

        this.inviteManager.addInvite(invite, from);
        return { success: true, inviteKey: invite.id };
    }



}