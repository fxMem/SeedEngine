import { User } from "../users/User";

export interface InvitationMethod {
    isCorrectInvitation(message: any): boolean;

    processInvite(message: any, from: User): void;
}