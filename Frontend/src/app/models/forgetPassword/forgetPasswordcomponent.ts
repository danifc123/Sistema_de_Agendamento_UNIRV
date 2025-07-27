import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";

@Component({
  selector: 'app-esqueceu-senha',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './forgetPassword.component.html',
  styleUrl: './forgetPassword.component.scss'
})
export class forgetPasswordComponent {

}
