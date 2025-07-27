import { Component, Input } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { InputPasswordComponent } from "../../components/input-password/input-password.component";

@Component({
  selector: 'app-login',
  imports: [InputComponent, InputPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Input({required: true}) title: string = "Login";

}
