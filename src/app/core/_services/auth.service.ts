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
  // SPA origin (use runtime origin so it matches dev/prod automatically)
  origin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost:4201';
  accessToken = signal<string | null>(null);
  refreshToken = signal<string | null>(null);

  currentUser = signal<User | null>(null);

  startExternalLogin(provider: string) {
    // start login in same window

    window.location.href = `${this.baseUrl}auth/login/${provider.toLowerCase()}?returnUrl=https://localhost:4201/bikes`;
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
