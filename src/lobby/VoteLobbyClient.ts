import { VoteType, VoteMessage, VoteNotificationHeader, VotesNotification } from "./VoteMessage";
import { LobbyMessage } from "./LobbyMessage";
import { Client, ClientConnectionHandler } from "../client/ClientConnectionHandler";
import { OperationResult } from "../core/OperationResult";

export class VoteLobbyClient implements Client {
    handler: ClientConnectionHandler;

    vote(sessionId: string, value: boolean): Promise<OperationResult> {
        return this.voteInternal(sessionId, value ? VoteType.Vote : VoteType.UnVote);
    }

    onVotesUpdate(callback: (data: VotesNotification) => void): void {
        this.handler.subscribeToTitledMessage(VoteNotificationHeader, callback);
    }

    private voteInternal(sessionId: string, vote: VoteType): Promise<OperationResult> {
        return this.handler.invokeWithMessage<VoteMessage & LobbyMessage>({
            sessionId,
            vote
        });
    }

}