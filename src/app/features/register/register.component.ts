import { Component, EventEmitter, Input, OnInit, output, Output, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators, FormsModule, ReactiveFormsModule, AsyncValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/core/_services/account.service';
import { DatePickerComponent } from 'src/app/shared/components/_forms/date-picker/date-picker.component';
import { TextInputComponent } from 'src/app/shared/components/_forms/text-input/text-input.component';
import { debounceTime, finalize, map, switchMap, take } from 'rxjs';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    imports: [FormsModule, ReactiveFormsModule, TextInputComponent, DatePickerComponent]
})
export class RegisterComponent implements OnInit {  
  cancelRegister = output<boolean>();
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors = signal<string[] | undefined>([]);

  private complexPassword = "(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$";

  constructor(private accountService: AccountService, private toastr: ToastrService, 
    private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
		this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18); 
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      // email: ['', [Validators.required, Validators.email], [this.validateEmailNotTaken()]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      // password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      password: ['', [Validators.required, Validators.pattern(this.complexPassword)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control?.value === control?.parent?.get(matchTo)?.value ? null : {isMatching: true}
    }
  }

  register() {
    const dob = this.GetDateOnly(this.registerForm.controls['dateOfBirth'].value)
    const values = {...this.registerForm.value, dateOfBirth: this.GetDateOnly(dob)}
    this.accountService.register(values).subscribe({
      next: response => {
        this.router.navigateByUrl('/bikes');
      },
      error: error => {
        this.validationErrors.set(error);
      } 
    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  private GetDateOnly(dob: string | undefined) {
    if (!dob) return;
    let theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes()-theDob.getTimezoneOffset())).toISOString().slice(0,10);
  }

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