import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AccountService } from 'src/app/core/_services/account.service';
import { HasRoleDirective } from 'src/app/shared/_directives/has-role.directive';
import { MemberStore } from 'src/app/core/_stores/member.store';
import { ThemeService } from 'src/app/core/_services/theme.service';
import { BikeStore } from 'src/app/core/_stores/bike.store';
import { AuthStore } from 'src/app/core/_stores/auth.store';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.css'],
    imports: [RouterLink, RouterLinkActive, HasRoleDirective, BsDropdownModule, CollapseModule, FormsModule,
      MatBadgeModule, MatButtonModule, MatIconModule, MatTooltipModule, MatInputModule, MatFormFieldModule
    ]
})
export class NavComponent {
  model: any = {}
  searchTerm = signal<string>('');

  isCollapsed = true;

  private router = inject(Router);
  private accountService = inject(AccountService);
  private themeService = inject(ThemeService);
  private bikeStore = inject(BikeStore);
  private authStore = inject(AuthStore);

  private memberStore = inject(MemberStore);

  // user = this.memberStore.user;
  user = this.authStore.currentUser;
  currentTheme = this.themeService.theme;

  constructor() { }

  login() {
    this.accountService.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl('/bikes');
        this.model = {}
      }
    })
  }

  logout() {
    this.accountService.logout();
    this.authStore.clear();
    this.router.navigateByUrl('/');
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  searchBikes() {
    const searchValue = this.searchTerm().trim();
    if (searchValue) {
      const params = this.bikeStore.bikeParams();
      if (params) {
        params.search = searchValue;
        this.bikeStore.setBikeParams(params);
        this.router.navigateByUrl('/bikes');
      }
    }
  }

  onSearchInputChange(value: string | null) {
    const searchValue = value || '';
    this.searchTerm.set(searchValue);

    if (!searchValue.trim()) {
      // Clear search when input is empty
      const params = this.bikeStore.bikeParams();
      if (params && params.search) {
        params.search = '';
        this.bikeStore.setBikeParams(params);
      }
    }
  }

  navigateToSignUp() {
    this.router.navigateByUrl('/register');
  }

  navigateToLogin() {
    this.router.navigateByUrl('/login');
  }

  onImgError(event: Event, filePath: string) {
    (event.target as HTMLImageElement).src = `${filePath}`;
  }
}
