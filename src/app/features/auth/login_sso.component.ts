import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "src/app/core/_models/user";
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

  }

  // login(provider: 'Google' | 'Facebook' | 'LinkedIn' | 'GitHub', returnUrl: string = '/'): void {
  //   this.authService.loginWithProvider(provider, returnUrl);
  // }

  loginWith(provider: string) {
    this.authService.startExternalLogin(provider);
  }

  onImgError(event: Event, provider: string) {
    (event.target as HTMLImageElement).src = `assets/icons/${provider}.svg`;
  }


}
