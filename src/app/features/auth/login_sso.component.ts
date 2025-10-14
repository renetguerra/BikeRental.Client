import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AuthService } from "src/app/core/_services/auth.service";

@Component({
  selector: 'app-login-sso',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './login_sso.component.html',
  styleUrls: ['./login_sso.component.css']
})

export class LoginSSOComponent {
  private authService = inject(AuthService);

  login(provider: 'Google' | 'Facebook' | 'LinkedIn' | 'GitHub') {
    this.authService.loginWithProvider(provider);
  }
}
