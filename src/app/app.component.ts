import { Component, OnInit, inject } from '@angular/core';
import { AccountService } from './core/_services/account.service';
import { ThemeService } from './core/_services/theme.service';
import { ConsoleErrorFilterService } from './core/_services/console-error-filter.service';
import { User } from './core/_models/user';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { NavComponent } from './features/nav/nav.component';
import { FooterComponent } from './features/footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    imports: [NgxSpinnerComponent, NavComponent, RouterOutlet, FooterComponent]
})
export class AppComponent implements OnInit {
  title = 'BikeRental app';
  users: User[] = [];

  private accountService = inject(AccountService);
  private themeService = inject(ThemeService);
  private consoleErrorFilter = inject(ConsoleErrorFilterService);

  ngOnInit(): void {
    this.setCurrentUser();
    this.initializeErrorFiltering();
    // Theme service is automatically initialized via injection
    // The constructor's effect() will apply the default theme (dark) to DOM
    // No additional code needed here - the service handles everything
  }

  /**
   * Initialize console error filtering to hide browser extension errors
   */
  private initializeErrorFiltering(): void {
    this.consoleErrorFilter.initialize();
  }

  /**
   * Set current user from localStorage if available
   */
  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user: User = JSON.parse(userString);
    this.accountService.setCurrentUser(user);
  }


}
