import { Component, OnInit } from '@angular/core';
import { ClientServiceService } from '../common/client-service.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  loading: boolean;
  errorMessage: string;
  constructor(private client: ClientServiceService) { }

  ngOnInit() {
    this.client.getPending().subscribe(p => {
      this.loading = p.pending;
      this.errorMessage = p.error;
    })
  }

}
