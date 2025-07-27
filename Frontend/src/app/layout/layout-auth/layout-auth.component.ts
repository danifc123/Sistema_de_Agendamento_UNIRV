import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { InputPasswordComponent } from "../../components/input-password/input-password.component";

@Component({
  selector: 'app-layout-auth',
  imports: [InputComponent, InputPasswordComponent],
  templateUrl: './layout-auth.component.html',
  styleUrl: './layout-auth.component.scss'
})
export class LayoutAuthComponent {

}
