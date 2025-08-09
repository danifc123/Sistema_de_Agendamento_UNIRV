import { Component } from '@angular/core';
import { CalendarioComponent } from "../../components/calendario/calendario.component";

@Component({
  selector: 'app-agendamentos',
  imports: [CalendarioComponent],
  templateUrl: './agendamentos.component.html',
  styleUrl: './agendamentos.component.scss'
})
export class AgendamentosComponent {

}
