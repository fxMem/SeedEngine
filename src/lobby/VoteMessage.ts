export enum VoteCommand {
    Vote,
    UnVote,
    GetVotes
}

export interface VoteMessage {
    vote: VoteCommand;
}

export const VoteNotificationHeader = 'vote';
export interface VotesNotification {
    voted: number,
    unvoted: number;
}