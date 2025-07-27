import {Component} from '@angular/core';
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

@Component({
  selector: 'app-input',
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
emailFormControl = new FormControl('', [Validators.required, Validators.email]);

  matcher = new ErrorStateMatcher();

}
