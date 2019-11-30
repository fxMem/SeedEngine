import { LobbyModule, LobbyContext } from "./LobbyModule";
import { VoteMessage, VoteCommand, VoteNotificationHeader, VotesNotification } from "./VoteMessage";
import { getUserInfoArray, UserInfoArray } from "../users/UserInfoArray";
import { createLocalLogScope } from "../log/LoggerScopes";
import { OperationResult, Success } from "../core/OperationResult";
import { ServerError } from "../transport/ServerError";
import { SessionState } from "../session/SessionInfo";

function isVoteMessage(message: any): message is VoteMessage {
    return message.vote !== undefined && message.sessionId != undefined;
}

type SessionVote = { sessionId: string, vote: VoteCommand };

export class VoteLobbyModule implements LobbyModule {
    private log = createLocalLogScope('VoteLobbyModule');

    constructor() {

    }

    isModuleCommand(message: any): boolean {
        return isVoteMessage(message);
    }

    handle({ message, from, session }: LobbyContext): Promise<any> {

        if (!isVoteMessage(message)) {
            throw new ServerError(`Message ${JSON.stringify(message)} is not vote message!`);
        }

        if (session.info.state === SessionState.running) {
            throw new ServerError(`Session ${session} already started, cannot vote!`);
        }

        let { vote } = message;
        let sessionId = session.id();
        let allVotes = session.players().map(p => getUserInfoArray<SessionVote>(p, 'votes'));
        if (vote === VoteCommand.GetVotes) {
            return Promise.resolve(getVotesSummary());
        }

        let userVote = allVotes.find(v => v.user.nickname === from.nickname);
        userVote.addOrUpdate
            (
                v => v.sessionId === sessionId,
                (v) => (v ? { ...v, vote } : { sessionId, vote })
            );

        this.log.info(`User ${from} have voted as ${VoteCommand[vote]}`);



        function getVotesSummary() {
            let voted = allVotes.filter(v => !!v.find(vote => vote.sessionId === sessionId && vote.vote === VoteCommand.Vote)).length;
            let needToVote = allVotes.length;
            return {
                voted,
                unvoted: needToVote - voted
            }
        }

        const summary = getVotesSummary();
        session.sendMessage<VotesNotification>({
            header: VoteNotificationHeader,
            payload: summary
        });

        if (summary.unvoted === 0) {

            this.log.info(`Everyone has voted! Starting session ${sessionId}`);
            session.start();
        }

        return Promise.resolve(Success);
    }
}