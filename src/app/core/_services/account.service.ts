import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { map } from 'rxjs';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  currentUser = signal<User | null>(null);
  roles = computed(() => {
    const user = this.currentUser();
    if (user && user.token) {
      const roles = JSON.parse(atob(user.token.split('.')[1])).role;
      return Array.isArray(roles) ? roles : [roles];
    }
    return [];
  })

  constructor(private http: HttpClient, private presenceService: PresenceService) { }

  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map(response => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  setCurrentUser(user: User) {
    // Ensure roles array exists and don't crash if token is missing/invalid
    user.roles = [];
    if (user?.token) {
      try {
        const decoded = this.getDecodedToken(user.token);
        const roles = decoded?.role ?? decoded?.roles ?? [];
        if (Array.isArray(roles)) user.roles = roles;
        else if (roles) user.roles.push(roles);
      } catch (e) {
        console.warn('AccountService.setCurrentUser: invalid token, skipping role decoding', e);
        user.roles = [];
      }
    } else {
      // token missing: leave roles empty
      user.roles = [];
    }

    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.warn('AccountService: failed to persist user to localStorage', e);
    }

    this.currentUser.set(user);
    this.presenceService.createHubConnection(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.presenceService.stopHubConnection();
  }

  getDecodedToken(token: string) {
    try {
      if (!token) throw new Error('empty token');
      const parts = token.split('.');
      if (parts.length < 2) throw new Error('token does not have 2 parts');
      const payload = parts[1];
      // atob can throw InvalidCharacterError if payload is not base64url; try replacing URL-safe chars
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if necessary
      const pad = base64.length % 4;
      const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
      return JSON.parse(atob(padded));
    } catch (e) {
      console.warn('AccountService.getDecodedToken: failed to decode token', e);
      return {} as any;
    }
  }

  checkEmailExists(email: string) {
    return this.http.get<boolean>(this.baseUrl + 'account/emailExists?email=' + email);
  }

  /**
   * Try to get the current user from the server using the HttpOnly cookie.
   * The backend should read the cookie and return the user DTO when present.
   * We set withCredentials:true to ensure cookies are sent for cross-site requests
   * when a proxy isn't used.
   */
  getCurrentUserFromServer() {
    return this.http.get<User>(this.baseUrl + 'auth/me', { withCredentials: true });
  }
}
