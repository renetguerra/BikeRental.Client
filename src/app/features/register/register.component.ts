import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, ReactiveFormsModule, AsyncValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/core/_services/account.service';
import { debounceTime, finalize, map, switchMap, take } from 'rxjs';

/**
 * RegisterComponent - Modern user registration with glassmorphism design
 *
 * Features:
 * - Complete user registration form with validation
 * - Animated avatar and card effects
 * - Password visibility toggle and strength indicator
 * - Email availability checking
 * - Glassmorphism and smooth animations
 * - Theme-aware styling
 * - Responsive design
 */
@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslocoModule
  ]
})
export class RegisterComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private toastr = inject(ToastrService);

  // Form state
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors = signal<string[] | undefined>([]);

  // UI state
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  avatarHovered = signal(false);
  agreeToTerms = signal(false);

  // Password validation
  private complexPassword = "(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{\":;'?/>.&lt;,])(?!.*\s).*$";

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', [Validators.required, Validators.minLength(3)]],
      // email: ['', [Validators.required, Validators.email], [this.validateEmailNotTaken()]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.pattern(this.complexPassword)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });

    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(value => !value);
  }

  /**
   * Handle avatar hover effects
   */
  onAvatarHover(isHovered: boolean): void {
    this.avatarHovered.set(isHovered);
  }

  /**
   * Toggle terms agreement
   */
  toggleTermsAgreement(): void {
    this.agreeToTerms.update(value => !value);
    this.registerForm.patchValue({ agreeToTerms: this.agreeToTerms() });
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldDisplayName(controlName)} must be at least ${minLength} characters`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('emailExists')) {
      return 'This email is already registered';
    }
    if (control?.hasError('isMatching')) {
      return 'Passwords do not match';
    }
    if (control?.hasError('pattern')) {
      return 'Password must contain uppercase, lowercase, number and special character';
    }
    return '';
  }

  /**
   * Get display name for form fields
   */
  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      name: 'Name',
      surname: 'Surname',
      knownAs: 'Known As',
      dateOfBirth: 'Date of Birth',
      city: 'City',
      country: 'Country',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return fieldNames[controlName] || controlName;
  }

  /**
   * Check if form control has error and is touched
   */
  hasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  /**
   * Get password strength indicator
   */
  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    if (password.length === 0) return '';

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+}{":;'?/>.<,]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1: return 'weak';
      case 2:
      case 3: return 'medium';
      case 4:
      case 5: return 'strong';
      default: return '';
    }
  }

  /**
   * Validator function to match password fields
   */
  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }

  /**
   * Handle form submission
   */
  register(): void {
    if (this.registerForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      const dob = this.GetDateOnly(this.registerForm.controls['dateOfBirth'].value);
      const values = {...this.registerForm.value, dateOfBirth: dob};

      this.accountService.register(values).subscribe({
        next: (response) => {
          this.toastr.success('Registration successful!', 'Welcome to BikeRental');
          this.router.navigateByUrl('/bikes');
        },
        error: (error) => {
          this.validationErrors.set(error);
          this.toastr.error('Registration failed', 'Error');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Navigate to sign in page
   */
  navigateToSignIn(): void {
    this.router.navigateByUrl('/signin');
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigateByUrl('/');
  }

  /**
   * Helper function to format date
   */
  private GetDateOnly(dob: string | undefined): string | undefined {
    if (!dob) return;
    let theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes()-theDob.getTimezoneOffset())).toISOString().slice(0,10);
  }

  /**
   * Async validator for email availability
   */
  private validateEmailNotTaken(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return control.valueChanges.pipe(
        debounceTime(1000),
        take(1),
        switchMap(() => {
          return this.accountService.checkEmailExists(control.value).pipe(
            map(result => result ? {emailExists: true} : null),
            finalize(() => control.markAsTouched())
          )
        })
      )
    }
  }
}