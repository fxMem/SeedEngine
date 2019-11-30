import { VoteCommand, VoteMessage, VoteNotificationHeader, VotesNotification } from "./VoteMessage";
import { LobbyMessage } from "./LobbyMessage";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { OperationResult } from "../core/OperationResult";

export class VoteLobbyClient implements Client {
    handler: ClientConnectionHandler;

    vote(sessionId: string, value: boolean): Promise<OperationResult> {
        return this.voteInternal(sessionId, value ? VoteCommand.Vote : VoteCommand.UnVote);
    }

    getVotesSummary(sessionId: string): Promise<{voted: number, unvoted: number}> {
        return this.handler.invokeWithMessage<VoteMessage & LobbyMessage>({
            sessionId,
            vote: VoteCommand.GetVotes
        });
    }

    onVotesUpdate(callback: (data: VotesNotification) => void): void {
        this.handler.subscribeToTitledMessage(VoteNotificationHeader, callback);
    }

    private voteInternal(sessionId: string, vote: VoteCommand): Promise<OperationResult> {
        return this.handler.invokeWithMessage<VoteMessage & LobbyMessage>({
            sessionId,
            vote
        });
    }

}