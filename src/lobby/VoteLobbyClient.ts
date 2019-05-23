import { ClientConnectionHandler, Client } from "../client";
import { OperationResult } from "../core";
import { VoteType, VoteMessage, VoteNotificationHeader, VotesNotification } from "./VoteMessage";
import { LobbyMessage } from "./LobbyMessage";



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