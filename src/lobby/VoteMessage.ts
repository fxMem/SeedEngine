export enum VoteType {
    Vote,
    UnVote
}

export interface VoteMessage {
    vote: VoteType;
}