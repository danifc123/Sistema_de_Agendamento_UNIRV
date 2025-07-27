import { Component, Input, input } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-layout-auth',
  imports: [RouterOutlet],
  templateUrl: './layout-auth.component.html',
  styleUrl: './layout-auth.component.scss'
})
export class LayoutAuthComponent {
@Input({required: true}) title: string = "";
}
