import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-lobby-room',
  templateUrl: './lobby-room.component.html',
  styleUrls: ['./lobby-room.component.css']
})
export class LobbyRoomComponent implements OnInit {

  private sessionId: string;
  constructor(private route: ActivatedRoute, private router: Router) { 
    this.sessionId = route.snapshot.paramMap.get('id');
  }

  ngOnInit() {

  }

  toLobby() {
    this.router.navigate(['lobby']);
  }
}
