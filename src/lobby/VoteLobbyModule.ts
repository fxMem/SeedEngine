import { LobbyModule, LobbyContext } from "./LobbyModule";
import { ServerError } from "@transport";
import { User } from "@users";
import { SessionHandler } from "@session";
import { createLocalLogScope } from "@log";
import { VoteMessage, VoteType } from "./VoteMessage";
import { Success, OperationResult } from "@core";

function isVoteMessage(message: any): message is VoteMessage {
    return message.vote !== undefined && message.sessionId != undefined;
}

type SessionVote = { sessionId: string, vote: VoteType };

class UserVote {
    private sessionVote: SessionVote;
    private userVotes: SessionVote[];
    constructor(private user: User, private sessionId: string) {
        this.userVotes = user.data.votes || [];
        this.sessionVote = this.userVotes.find(v => v.sessionId === sessionId);
    }

    isUserVoted(): boolean {
        return this.sessionVote && this.sessionVote.vote === VoteType.Vote;
    }

    vote(voteType: VoteType) {
        if (!this.sessionVote) {
            this.sessionVote = { sessionId: this.sessionId, vote: VoteType.UnVote };
            this.userVotes.push(this.sessionVote);
        }

        this.sessionVote.vote = voteType;
    }
}

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
        let userVote = new UserVote(from, session.id());
        userVote.vote(vote);

        this.log.info(`User ${from} have voted as ${VoteType[vote]}`);

        if (this.checkIfAllVoted(session)) {

            this.log.info(`Everyone has voted! Starting session ${session.id()}`);
            session.start();
        }

        return Promise.resolve(Success);
    }

    private checkIfAllVoted(session: SessionHandler): boolean {

        // Maybe refactor it so not to create vote object every time, but for now it should do
        return !session.players().some(u => (new UserVote(u, session.id()).isUserVoted()));
    }
}