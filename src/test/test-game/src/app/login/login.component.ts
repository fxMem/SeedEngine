import { Component, OnInit } from '@angular/core';
import { ClientServiceService } from '../common/client-service.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { InviteDataBagService } from '../common/invite-routing.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor
  (
    private inviteDataBag: InviteDataBagService,
    private client: ClientServiceService,
    private router: Router
  ) 
  { }

  login(login: string, password: string) {
    this.client.connect(login, password ).then(result => {

      if (this.inviteDataBag.inviteKey) {
        this.router.navigate(['invite', this.inviteDataBag.inviteKey]);
      }
      else {
        this.router.navigate(['lobby']);
      }
      
    })
  }

  ngOnInit() {

  }

}
