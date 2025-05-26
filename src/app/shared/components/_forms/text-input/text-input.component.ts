import { Component, input, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-text-input',
    templateUrl: './text-input.component.html',
    styleUrls: ['./text-input.component.css'],
    imports: [FormsModule, ReactiveFormsModule]
})
export class TextInputComponent implements ControlValueAccessor {  
  label = input<string>('');  
  type = input<string>('text');

  constructor(@Self() public ngControl: NgControl) { 
    this.ngControl.valueAccessor = this;
  }

  writeValue(obj: any): void {
  }

  registerOnChange(fn: any): void {
  }

  registerOnTouched(fn: any): void {
  }

  get control(): FormControl {
    return this.ngControl.control as FormControl
  }
}