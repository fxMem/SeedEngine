import { SpecificMessageTypeHandler, MessageContext, Message } from "@transport";
import { InvitationMethod } from "./InvitationMethod";
import { isCreateInviteMessage, CreateInviteMessage } from "./InviteMessage";
import { User, Users } from "@users";
import { InviteBuilder } from "./Invite";
import { InvitationManager } from "./InvitationManager";

export class InvitesPipeline implements SpecificMessageTypeHandler {

    constructor(private methods: InvitationMethod[], private inviteManager: InvitationManager) {

    }

    canHandle(message: Message): boolean {
        return isCreateInviteMessage(message) || this.methods.some(m => m.isCorrectInvitation(message));
    }

    async handle(context: MessageContext): Promise<any> {

        let { message, from, users } = context;
        if (isCreateInviteMessage(message)) {
            return this.createInvite(message, from, users);
        }

        let method = this.methods.filter(m => m.isCorrectInvitation(message))[0];
        return method.processInvite(message, from);
    }

    private createInvite(message: CreateInviteMessage, from: User, users: Users): { success: boolean } {
        let invite = InviteBuilder
            .forSession(message.inviteToSession)
            .validUntil(message.expires)
            .withUseCount(message.attemptsCount)
            .forUsers(message.userIds.map(u => users.getUserById(u)))
            .build();

        this.inviteManager.addInvite(invite, from);
        return { success: true };
    }



}