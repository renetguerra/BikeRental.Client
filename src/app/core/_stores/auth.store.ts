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

  private accountService = inject(AccountService);
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
    // Hydrate store from localStorage if available
    const at = localStorage.getItem('access_token');
    const rt = localStorage.getItem('refresh_token');

    const token = getCookie('ACCESS_TOKEN');
    if (token) {
      try {
        // const payload = JSON.parse(atob(token.split('.')[1]));
        // const user: User = {
        //   username: payload.unique_name || payload.username || payload.email?.split('@')[0],
        //   roles: Array.isArray(payload.role) ? payload.role : [payload.role].filter(Boolean),
        //   knownAs: payload.unique_name || payload.username,
        //   token,
        //   photoUrl: payload.picture || '',
        //   gender: payload.gender || ''
        // };
        const user = this.userFromToken(token);
        this._currentUser.set(user);
        this.accountService.setCurrentUser(user!);
      } catch (e) {
        console.warn('No se pudo decodificar el token JWT', e);
      }
    }

    if (at || rt) {
      this._accessToken.set(at);
      this._refreshToken.set(rt);
      if (at) {
        const user = this.userFromToken(at);
        if (user) this._currentUser.set(user);
      }
    }
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

  setCurrentUser(user: User | null) {
    // Debug: log the user object before applying it to the store
    try {
      console.debug('AuthStore.setCurrentUser', user);
    } catch (e) {
      // ignore console errors in exotic runtimes
    }

    // Persist user to both localStorage and sessionStorage for visibility and recovery
    if (user) {
      try {
        const str = JSON.stringify(user);
        localStorage.setItem('user', str);
        sessionStorage.setItem('user', str);
      } catch (e) {
        console.warn('AuthStore: failed to persist user to storage', e);
      }
    } else {
      try {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      } catch (e) {
        // ignore
      }
    }

    this._currentUser.set(user);
    if (user?.token) this.setTokens(user.token, this._refreshToken());
  }

  clear() {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // Helper to build a minimal User from a JWT
  userFromToken(token: string): User | null {
    const decoded = decodeJwtPayload<any>(token);
    if (!decoded) return null;

    const rolesRaw = decoded.role ?? decoded.roles ?? [];
    const roles = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw].filter(Boolean);
    const username = decoded.unique_name ?? decoded.username ?? (decoded.email ? decoded.email.split('@')[0] : '');
    const email = decoded.email ?? '';

    return {
      username,
      token,
      email,
      photoUrl: '',
      knownAs: username,
      gender: '',
      roles
    } as User;
  }

  // private userFromToken(token: string): User | null {
  //   try {
  //     const decoded = (jwt_decode as any)(token) as DecodedToken;
  //     const rolesRaw = decoded.role ?? decoded.roles ?? [];
  //     const roles = Array.isArray(rolesRaw) ? rolesRaw : [rolesRaw].filter(Boolean);
  //     const username = decoded.unique_name ?? decoded.username ?? decoded.email?.split('@')[0] ?? '';
  //     const email = decoded.email ?? '';
  //     const user: User = {
  //       username: username,
  //       token: token,
  //       photoUrl: '',
  //       knownAs: username,
  //       gender: '',
  //       roles: roles
  //     };
  //     return user;
  //   } catch (e) {
  //     console.error('Failed to decode token for userFromToken', e);
  //     return null;
  //   }
  // }
}


