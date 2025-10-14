import { Injectable, signal } from '@angular/core';
import { UserManager, User } from 'oidc-client-ts';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal for current user
  user = signal<User | null>(null);

  // OIDC configuration
  private userManager = new UserManager({
    authority: 'https://localhost:5001', // Backend URL
    client_id: 'bikerental-angular',     // Must match backend config
    redirect_uri: 'http://localhost:4200/auth-callback',
    response_type: 'code',
    scope: 'openid profile api.bikerental',
    post_logout_redirect_uri: 'http://localhost:4200/'
  });

  // Start login flow
  loginWithProvider(provider: 'Google' | 'Facebook' | 'LinkedIn' | 'GitHub') {
    this.userManager.signinRedirect({ extraQueryParams: { provider } });
  }

  // Handle callback after login
  async handleCallback() {
    const user = await this.userManager.signinRedirectCallback();
    this.user.set(user);
    localStorage.setItem('access_token', user.access_token);
  }

  // Logout
  logout() {
    this.userManager.signoutRedirect();
    this.user.set(null);
    localStorage.removeItem('access_token');
  }
}
