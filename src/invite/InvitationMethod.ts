import { User } from "../users";

export interface InvitationMethod {
    isCorrectInvitation(message: any): boolean;

    processInvite(message: any, from: User): void;
}