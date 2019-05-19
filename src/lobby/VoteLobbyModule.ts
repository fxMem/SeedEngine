import { LobbyModule, LobbyContext } from "./LobbyModule";
import { VoteMessage, VoteType, VoteNotificationHeader, VotesNotification } from "./VoteMessage";
import { createLocalLogScope } from "../log";
import { OperationResult, Success } from "../core";
import { ServerError } from "../transport";
import { getUserInfoArray, UserInfoArray } from "../users/UserInfoArray";

function isVoteMessage(message: any): message is VoteMessage {
    return message.vote !== undefined && message.sessionId != undefined;
}

type SessionVote = { sessionId: string, vote: VoteType };

export class VoteLobbyModule implements LobbyModule {
    private log = createLocalLogScope(nameof(VoteLobbyModule));

    constructor() {

    }

    isModuleCommand(message: any): boolean {
        return isVoteMessage(message);
    }

    handle({ message, from, session }: LobbyContext): Promise<OperationResult> {

        if (!isVoteMessage(message)) {
            throw new ServerError(`Message ${JSON.stringify(message)} is not vote message!`);
        }

        let { vote } = message;
        let sessionId = session.id();
        let allVotes = session.players().map(p => getUserInfoArray<SessionVote>(p, 'votes'));
        let userVote = allVotes.find(v => v.user.nickname === from.nickname);
        userVote.addOrUpdate
            (
                v => v.sessionId === sessionId,
                (v) => (v ? { ...v, vote } : { sessionId, vote })
            );

        this.log.info(`User ${from} have voted as ${VoteType[vote]}`);

        session.sendMessage<VotesNotification>({
            header: VoteNotificationHeader, 
            payload: {
                voted: allVotes.filter(v => !!v.find(vote => vote.sessionId === sessionId && vote.vote === VoteType.Vote)).length,
                unvoted: allVotes.filter(v => !!v.find(vote => vote.sessionId === sessionId && vote.vote === VoteType.UnVote)).length,
            }
        });
        
        if (this.checkIfAllVoted(allVotes, sessionId)) {

            this.log.info(`Everyone has voted! Starting session ${sessionId}`);
            session.start();
        }

        return Promise.resolve(Success);
    }

    private checkIfAllVoted(votes: UserInfoArray<SessionVote>[], sessionId: string): boolean {

        return !votes.some(u => !!u.find(v => v.sessionId === sessionId && v.vote === VoteType.UnVote));
    }
}