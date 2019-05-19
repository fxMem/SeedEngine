import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientServiceService } from '../common/client-service.service';

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
  private sessionId: string;
  constructor(
      private route: ActivatedRoute, 
      private router: Router, 
      private client: ClientServiceService) { 
    this.sessionId = route.snapshot.paramMap.get('id');

    this.client.getVotes().subscribe(v => {
      this.votingProgressText = this.getProgressText(v.voted, v.unvoted);
    });
  }

  ngOnInit() {
    this.updateVoteText();
  }

  toLobby() {
    this.router.navigate(['lobby']);
  }

  switchVote() {
    this.vote = !this.vote;
    this.client.vote(this.sessionId, this.vote);

    this.updateVoteText();
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
