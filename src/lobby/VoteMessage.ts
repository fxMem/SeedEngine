export enum VoteType {
    Vote,
    UnVote
}

export interface VoteMessage {
    vote: VoteType;
}

export const VoteNotificationHeader = 'vote';
export interface VotesNotification {
    voted: number,
    unvoted: number;
}