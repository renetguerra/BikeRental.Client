import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-server-error',
    templateUrl: './server-error.component.html',
    styleUrls: ['./server-error.component.css'],
  imports: [TranslocoModule]
})
export class ServerErrorComponent implements OnInit {
  error: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.error = navigation?.extras?.state?.['error'];
  }

  ngOnInit(): void {
  }

}