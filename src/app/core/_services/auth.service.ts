import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { User } from '../_models/user';
import { AuthStore } from '../_stores/auth.store';
import { AccountService } from './account.service';

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
    window.location.href = `${this.baseUrl}auth/${provider}/challenge`;
  }

  startExternalLogin1(provider: string) {
    const url = `${this.baseUrl}auth/${provider}/challenge`;
    const w = 600, h = 700;
    const left = window.screenX + (window.innerWidth - w) / 2;
    const top = window.screenY + (window.innerHeight - h) / 2;
    this.popup = window.open(url, 'auth_popup', `width=${w},height=${h},left=${left},top=${top}`);

    // compute backend origin from baseUrl (strip /api/ if present)
    let backendOrigin = this.baseUrl;
    try {
      // baseUrl might be like 'https://localhost:5001/api/' so use URL to get origin
      const u = new URL(this.baseUrl);
      backendOrigin = u.origin;
    } catch {
      backendOrigin = this.baseUrl.replace(/\/api\/?$/, '');
    }

    const handler = (event: MessageEvent) => {
      console.debug('AuthService message event received', event.origin, event.data);
      // Accept messages from backend origin OR from SPA origin (fallback when popup redirects to SPA)
      const spaOrigin = this.origin;
      if (event.origin !== backendOrigin && event.origin !== spaOrigin) {
        console.warn('Ignored message from origin', event.origin);
        return;
      }
      const data = event.data;
      if (!data || data.type !== 'external_auth') {
        console.warn('Ignored message with unexpected shape', data);
        return;
      }

      // process tokens/user
      const accessToken = data.accessToken as string | undefined;
      const refreshToken = data.refreshToken as string | undefined;
      const user = data.user as any | undefined;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        this.accessToken.set(accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
        this.refreshToken.set(refreshToken);
      }

      if (user) {
        try { this.accountService.setCurrentUser(user); } catch (e) { console.error(e); }
      }

      // cleanup and close popup
      window.removeEventListener('message', handler);
      try { this.popup?.close(); } catch (e) { console.warn('Failed to close popup', e); }
      // navigate after setting user
      try { this.router.navigate(['/']); } catch (e) { console.warn(e); }
    };

    window.addEventListener('message', handler, false);

    // Failsafe: if no message received in X seconds, remove listener and try to close popup
    const cleanupTimeout = setTimeout(() => {
      console.warn('SSO popup timeout - no message received, cleaning up');
      window.removeEventListener('message', handler);
      try { this.popup?.close(); } catch (e) { console.warn('Failed to close popup on timeout', e); }
    }, 60_000); // 60s

    // When handler runs we removed the listener but also clear the timeout; wrap handler to clear
    const wrappedHandler = (event: MessageEvent) => {
      try { handler(event); } finally { clearTimeout(cleanupTimeout); }
    };

    // replace listener with wrapped handler so timeout is cleared when message arrives
    window.removeEventListener('message', handler);
    window.addEventListener('message', wrappedHandler, false);
  }

  private receiveMessage = (event: MessageEvent) => {
    // Validate origin: allow backend or configured SPA origin
    const allowedOrigins = [this.baseUrl.replace(/\/api\/$/, ''), this.origin];
    if (!allowedOrigins.includes(event.origin)) return;
    const data = event.data;
    if (!data || data.type !== 'external_auth') return;

    // Tokens
    const at = data.accessToken ?? null;
    const rt = data.refreshToken ?? null;

    this.accessToken.set(at);
    this.refreshToken.set(rt);

    if (at) localStorage.setItem('access_token', at);
    if (rt) localStorage.setItem('refresh_token', rt);

    this.authStore.setTokens(at, rt);

    // Backend may send a full user object, or only tokens. Ensure we set AccountService.currentUser accordingly
    if (data.user && data.user.token) {
      // Backend provided a full user object
      this.accountService.setCurrentUser(data.user);
    } else if (at) {
      // Build minimal user object from access token
      const user: any = { token: at };
      try {
        const payload = JSON.parse(atob(at.split('.')[1]));
        user.username = payload.unique_name || payload.username || payload.email?.split('@')[0];
        user.email = payload.email;
        user.roles = Array.isArray(payload.role) ? payload.role : [payload.role].filter(Boolean);
        user.knownAs = user.username;
      } catch (e) {
        // ignore decode errors
      }
      this.accountService.setCurrentUser(user);
    }

    // Close popup safely
    try { this.popup?.close(); } catch (e) {}
    // Optional: navigate after SSO
    // this.router.navigate(['/']);
  };

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
