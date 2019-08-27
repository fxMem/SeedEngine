import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientServiceService } from '../common/client-service.service';
import { InviteInfo } from 'seedengine.client/invite/InviteInfo';
import { InviteDataBagService } from '../common/invite-routing.service';

@Component({
  selector: 'app-invites',
  templateUrl: './invites.component.html',
  styleUrls: ['./invites.component.css']
})
export class InvitesComponent implements OnInit {
  private inviteKey: string;
  public data: InviteInfo;
  public message: string;

  constructor(
    private inviteDataBag: InviteDataBagService,
    private route: ActivatedRoute, 
    private router: Router, 
    private client: ClientServiceService) {
      this.inviteKey = route.snapshot.paramMap.get('id');

     }

  async ngOnInit() {
    if (!this.client.isConnected) {

      // maybe use route parameters instead of this?
      this.inviteDataBag.inviteKey = this.inviteKey;
      this.router.navigate(['login']);
      return;
    }

    this.data = await this.client.getInviteInfo(this.inviteKey);
    var a = 1 * 11;
  }

  async join() {

    const onError = () => { 
      this.message = `Wasn't able to use the invite! Please check in with the issuer!`;
    };
    this.message = null;
    try {
      const res = await this.client.useInvite(this.inviteKey);

      if (!res.success) {
        onError();
        return;
      }

      if (!this.data) {
        onError();
        return;
      }

      this.router.navigate(['room', this.data.sessionId]);
    } 
    catch (e) {
      onError();
    }
    

  }
}
