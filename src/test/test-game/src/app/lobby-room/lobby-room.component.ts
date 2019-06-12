import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientServiceService } from '../common/client-service.service';
import { SessionState } from 'seedengine.client/session/SessionInfo';

const voteText = 'Vote';
const unvoteText = 'UnVote';

@Component({
  selector: 'app-lobby-room',
  templateUrl: './lobby-room.component.html',
  styleUrls: ['./lobby-room.component.css']
})
export class LobbyRoomComponent implements OnInit {

  votingProgressText: string;
  switchVoteText: string = voteText;
  vote: boolean = false;
  gameActive: boolean;
  sessionId: string;
  private gameState: SessionState;

  constructor(
      private route: ActivatedRoute, 
      private router: Router, 
      private client: ClientServiceService) { 
    this.sessionId = route.snapshot.paramMap.get('id');

    this.client.getVotes().subscribe(v => {
      this.votingProgressText = this.getProgressText(v.voted, v.unvoted);
    });

    this.client.getSessionStateChanges().subscribe(d => {
      this.updateSessionState(d.nextState);
    });
  }

  ngOnInit() {
    this.updateVoteText();

    this.client.getSession(this.sessionId).then((i) => {
      this.updateSessionState(i.state);
    });
  }

  toLobby() {
    this.router.navigate(['lobby']);
  }

  switchVote() {
    this.vote = !this.vote;
    this.client.vote(this.sessionId, this.vote);

    this.updateVoteText();
  }

  private updateSessionState(state: SessionState) {
    this.gameState = state;
    this.gameActive = this.gameState === SessionState.running || this.gameState === SessionState.halted;
  }

  private updateVoteText() {
    this.switchVoteText = this.getButtonVoteText();
  }

  private getButtonVoteText() {
    return this.vote ? unvoteText : voteText;
  }

  private getProgressText(voted: number, notVoted: number) {
    return `Voted ${voted} from ${voted + notVoted}`;
  }
}
