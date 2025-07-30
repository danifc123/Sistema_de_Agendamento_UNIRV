import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { CalendarioComponent } from "../../components/calendario/calendario.component";


@Component({
  selector: 'app-layout-default',
  imports: [MatIconModule, CalendarioComponent],
  templateUrl: './layout-default.component.html',
  styleUrl: './layout-default.component.scss'
})
export class LayoutDefaultComponent {

}
