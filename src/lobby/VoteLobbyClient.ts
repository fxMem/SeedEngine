import { Client, ClientConnectionHandler } from "@client";
import { VoteMessage, VoteType } from "./VoteMessage";
import { LobbyMessage } from "./LobbyMessage";

export class VoteLobbyClient implements Client {
    handler: ClientConnectionHandler;

    vote(sessionId: string): Promise<void> {
        return this.voteInternal(sessionId, VoteType.Vote);
    }

    unVote(sessionId: string): Promise<void> {
        return this.voteInternal(sessionId, VoteType.UnVote);
    }

    private voteInternal(sessionId: string, vote: VoteType): Promise<void> {
        return this.handler.invokeWithMessage<VoteMessage & LobbyMessage>({
            sessionId: sessionId,
            vote
        });
    }

}