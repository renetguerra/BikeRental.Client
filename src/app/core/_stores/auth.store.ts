import { computed, Injectable, signal, WritableSignal, Signal, inject } from '@angular/core';
import { User } from '../_models/user';
import { decodeJwtPayload } from 'src/app/shared/_extensions/decodeJwt';
import { getCookie } from 'src/app/shared/_extensions/getCookie';
import { AccountService } from '../_services/account.service';

interface DecodedToken {
  sub?: string;
  unique_name?: string;
  username?: string;
  email?: string;
  role?: string | string[];
  roles?: string[];
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {

  // Elimina la inyección directa de AccountService para evitar ciclo DI

  // Internal writable signals
  private _accessToken: WritableSignal<string | null> = signal<string | null>(null);
  private _refreshToken: WritableSignal<string | null> = signal<string | null>(null);
  private _currentUser: WritableSignal<User | null> = signal<User | null>(null);

  // Exposed readonly signals (best practice)
  accessToken: Signal<string | null> = this._accessToken.asReadonly();
  refreshToken: Signal<string | null> = this._refreshToken.asReadonly();
  currentUser: Signal<User | null> = this._currentUser.asReadonly();

  // Derived computed signals
  roles = computed(() => {
    const u = this._currentUser();
    return u?.roles ?? [];
  });

  constructor() {
    // Hidrata el usuario desde cookie o localStorage al iniciar el store
    this.refreshCurrentUser();
  }

  // Public API
  setTokens(accessToken: string | null, refreshToken: string | null) {
    this._accessToken.set(accessToken);
    this._refreshToken.set(refreshToken);

    if (accessToken) localStorage.setItem('access_token', accessToken);
    else localStorage.removeItem('access_token');

    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    else localStorage.removeItem('refresh_token');

    // update currentUser when accessToken changes
    if (accessToken) {
      const user = this.userFromToken(accessToken);
      if (user) this._currentUser.set(user);
    }
  }

  setCurrentUser(user?: User) {
    // Persist user to both localStorage and sessionStorage for visibility and recovery
    if (user) {
      try {
        this._currentUser.set(user);
      } catch (e) {
        console.warn('AuthStore: failed to persist user to storage', e);
      }
    } else {
      try {
        if (localStorage.getItem('user')) {
          this._currentUser.set(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
        }
        else {
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
        }

      } catch (e) {
        // ignore
      }
    }

    // this._currentUser.set(user);
    // if (user?.token) this.setTokens(user.token, this._refreshToken());
  }

  // Allows updating the user in AccountService if passed as an argument
  refreshCurrentUser(accountService?: { currentUser: any }) {
    const token = getCookie('ACCESS_TOKEN') || localStorage.getItem('access_token');
    if (token) {
      const user = this.userFromToken(token);
      if (user) {
        this._currentUser.set(user);
        if (accountService) accountService.currentUser.set(user);
      }
    } else {
      this._currentUser.set(null);
      if (accountService) accountService.currentUser.set(null);
    }
  }

  clear() {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    const cookieNames = ['ACCESS_TOKEN', 'REFRESH_TOKEN', 'user'];
    cookieNames.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    });
  }

  // Helper to build a minimal User from a JWT
  userFromToken(token: string): User | null {
    const decoded = decodeJwtPayload<any>(token);
    if (!decoded) return null;

    const rolesRaw = decoded.role ?? decoded.roles ?? [];
    const roles = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw].filter(Boolean);
    const username = decoded.unique_name ?? decoded.username ?? (decoded.email ? decoded.email.split('@')[0] : '');
    const email = decoded.email ?? '';
    const photoUrl = decoded.photoUrl ?? '';

    return {
      username,
      token,
      email,
      photoUrl,
      knownAs: username,
      gender: '',
      roles
    } as User;
  }
}


