import { Client, ClientConnectionHandler } from "@client";
import { VoteMessage, VoteType } from "./VoteMessage";
import { LobbyMessage } from "./LobbyMessage";
import { OperationResult } from "@core";

export class VoteLobbyClient implements Client {
    handler: ClientConnectionHandler;

    vote(sessionId: string): Promise<OperationResult> {
        return this.voteInternal(sessionId, VoteType.Vote);
    }

    unVote(sessionId: string): Promise<OperationResult> {
        return this.voteInternal(sessionId, VoteType.UnVote);
    }

    private voteInternal(sessionId: string, vote: VoteType): Promise<OperationResult> {
        return this.handler.invokeWithMessage<VoteMessage & LobbyMessage>({
            sessionId: sessionId,
            vote
        });
    }

}