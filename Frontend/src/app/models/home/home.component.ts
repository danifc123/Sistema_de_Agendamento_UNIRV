import { Component } from '@angular/core';
import { CalendarioComponent } from "../../components/calendario/calendario.component";
import { InputComponent } from "../../components/input/input.component";
import { TabelaAgendamentoComponent } from "../../components/tabela-agendamento/tabela-agendamento.component";

@Component({
  selector: 'app-home',
  imports: [CalendarioComponent, InputComponent, TabelaAgendamentoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
