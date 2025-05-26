import { Component, OnInit } from '@angular/core';
import { AccountService } from './core/_services/account.service';
import { User } from './core/_models/user';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { NavComponent } from './features/nav/nav.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [NgxSpinnerComponent, NavComponent, RouterOutlet]
})
export class AppComponent implements OnInit {
  title = 'Kita app';
  users: any;

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user: User = JSON.parse(userString);
    this.accountService.setCurrentUser(user);
  }


}
