import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountService } from 'src/app/core/_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { LoginSSOComponent } from '../auth/login_sso.component';

/**
 * SignInComponent - Modern login component with glassmorphism design
 *
 * Features:
 * - Username and Password fields with validation
 * - Animated avatar and card effects
 * - Password visibility toggle
 * - Remember me functionality
 * - Glassmorphism and smooth animations
 * - Theme-aware styling
 * - Responsive design
 */
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    LoginSSOComponent
  ]
})
export class SignInComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  // Form state
  signInForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  rememberMe = signal(false);

  // Avatar animation state
  avatarHovered = signal(false);

  constructor() {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      rememberMe: [false]
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Toggle remember me
   */
  toggleRememberMe(): void {
    this.rememberMe.update(value => !value);
    this.signInForm.patchValue({ rememberMe: this.rememberMe() });
  }

  /**
   * Handle avatar hover effects
   */
  onAvatarHover(isHovered: boolean): void {
    this.avatarHovered.set(isHovered);
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.signInForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(controlName)} must be at least ${minLength} characters`;
    }
    return '';
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      username: 'Username',
      password: 'Password'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Check if form control has error and is touched
   */
  hasError(controlName: string): boolean {
    const control = this.signInForm.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.signInForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const formValue = this.signInForm.value;
      const loginData = {
        username: formValue.username,
        password: formValue.password
      };

      this.accountService.login(loginData).subscribe({
        next: (response) => {
          this.toastr.success('Welcome back!', 'Login Successful');
          this.router.navigateByUrl('/bikes');
        },
        error: (error) => {
          this.toastr.error('Invalid username or password', 'Login Failed');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signInForm.controls).forEach(key => {
        this.signInForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    this.router.navigateByUrl('/register');
  }

  /**
   * Handle forgot password
   */
  onForgotPassword(): void {
    this.toastr.info('Password reset functionality coming soon!', 'Info');
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigateByUrl('/');
  }
}
