import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user';
import { AuthStore } from '../_stores/auth.store';
import { AccountService } from './account.service';
import { getCookie } from 'src/app/shared/_extensions/getCookie';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private accountService = inject(AccountService);

  baseUrl = environment.apiUrl;
  popup: Window | null = null;

  accessToken = signal<string | null>(null);
  refreshToken = signal<string | null>(null);

  currentUser = signal<User | null>(null);

  startExternalLogin(provider: string) {
    const currentOrigin = window.location.origin;
    window.location.href = `${this.baseUrl}auth/login/${provider.toLowerCase()}?returnUrl=${currentOrigin}/bikes`;
  }

  logout() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return this.accessToken() ?? localStorage.getItem('access_token');
  }
}
