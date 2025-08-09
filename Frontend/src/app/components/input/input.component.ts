import {Component, Input, Output, EventEmitter } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';


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
  styleUrl: './input.component.scss'
})
export class InputComponent {
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  matcher = new ErrorStateMatcher();


  passwordFormControl = new FormControl('', [Validators.required]);
  match = new MyErrorStateMatcher();

  @Input({required: true}) label!: string;
  @Input() type: 'text' | 'email' | 'password' | 'date' | 'time' | 'textarea' = 'text';
  @Input() placeholder: string = '';
  @Input() rows: number = 4;

  @Input() value: any;
  @Output() valueChange = new EventEmitter<any>();
}
