import { ClientConnectionHandler, Client } from "../client";
import { OperationResult } from "../core";
import { VoteType, VoteMessage } from "./VoteMessage";
import { LobbyMessage } from ".";


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