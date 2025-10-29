import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, forwardRef } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input({ required: true }) label!: string;
  @Input() type: 'text' | 'email' | 'password' | 'date' | 'time' | 'textarea' = 'text';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;
  @Input() value: any = '';
  @Output() valueChange = new EventEmitter<any>();

  emailFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);
  textFormControl = new FormControl('');

  matcher = new ErrorStateMatcher();
  match = new MyErrorStateMatcher();

  ngOnInit() {
    this.updateFormControlValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.updateFormControlValue();
    }
  }

  private updateFormControlValue() {
    if (this.label === 'Email' || this.label === 'email') {
      this.emailFormControl.setValue(this.value || '');
    } else if (this.label === 'Senha' || this.label === 'Confirmar Senha' || this.label === 'Password' || this.label === 'password') {
      this.passwordFormControl.setValue(this.value || '');
    } else {
      this.textFormControl.setValue(this.value || '');
    }
  }

  onValueChange(newValue: any) {
    this.value = newValue;
    this.valueChange.emit(newValue);
    this.onChange();
  }

  // ControlValueAccessor methods
  private onChange = () => { return; };
  private onTouched = () => { return; };

  writeValue(value: any): void {
    this.value = value;
    this.updateFormControlValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.emailFormControl[isDisabled ? 'disable' : 'enable']();
    this.passwordFormControl[isDisabled ? 'disable' : 'enable']();
    this.textFormControl[isDisabled ? 'disable' : 'enable']();
  }
}
