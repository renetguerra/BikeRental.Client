import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "src/app/core/_services/account.service";
import { AuthService } from "src/app/core/_services/auth.service";
import { AuthStore } from "src/app/core/_stores/auth.store";

@Component({
  selector: 'app-login-sso',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './login_sso.component.html',
  styleUrls: ['./login_sso.component.css']
})

export class LoginSSOComponent implements OnInit {
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);
  private accountService = inject(AccountService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);


  errorMessage: string = '';

  ngOnInit() {
  // Captura el token cuando Google redirige de vuelta
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        // localStorage.setItem('token', params['token']);
        // this.authStore.userFromToken(params['token']); // implement helper to extract claims or ask backend to include user DTO
        // this.router.navigate(['/']);
        this.handleToken(params['token']);
      } else if (params['error']) {
        this.errorMessage = params['error'];
      }
    });

    this.route.fragment.subscribe(fragment => {
      if (!fragment) return;
      // fragment could be "token=xxx" or "token=xxx&returnUrl=..."
      const m = new URLSearchParams(fragment);
      const t = m.get('token');
      if (t) this.handleToken(t);
    });
  }

  // login(provider: 'Google' | 'Facebook' | 'LinkedIn' | 'GitHub', returnUrl: string = '/'): void {
  //   this.authService.loginWithProvider(provider, returnUrl);
  // }

  loginWith(provider: string) {
    this.authService.startExternalLogin(provider);

    this.accountService.getCurrentUserFromServer().subscribe({
      next: (user) => {
        if (user) this.accountService.setCurrentUser(user);
        // this.router.navigate(['/bikes']);
      },
      error: () => {
        // no-op: no cookie or not authenticated
      }
    });
  }

  private handleToken(token: string) {
    // Store token and set current user in app
    try {
      localStorage.setItem('access_token', token);
    } catch (e) {
      console.warn('Failed to persist token', e);
    }

    // If you have an authStore.userFromToken, use it to get a minimal user
    const user = this.authStore.userFromToken(token);
    if (user) {
      this.accountService.setCurrentUser(user);
    } else {
      // Optional: if you need full user info, call backend /account/me with token
      // or call a backend endpoint that returns user from token.
    }

    // Clean URL (remove fragment) so token isn't visible in history
    try {
      this.router.navigate([], { replaceUrl: true, queryParamsHandling: 'preserve' });
    } catch {}

    // Redirect after login
    try { this.router.navigate(['/bikes']); } catch {}
  }

  googleLoginPopup(): void {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      'https://localhost:5001/api/auth/google/login',
      'Google Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Escuchar mensaje del popup
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://localhost:5001') {
        if (event.data.token) {
          localStorage.setItem('token', event.data.token);
          popup?.close();
          this.router.navigate(['/']);
        }
      }
    });
  }
}
