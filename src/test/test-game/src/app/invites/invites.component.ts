import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientServiceService } from '../common/client-service.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.css']
})
export class InvitesComponent implements OnInit {
  private inviteKey: string;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private client: ClientServiceService) {
      this.inviteKey = route.snapshot.paramMap.get('id');

     }

  ngOnInit() {
    
  }

}
