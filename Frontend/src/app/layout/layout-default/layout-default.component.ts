import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
 import { TabelaAgendamentoComponent } from "../../components/tabela-agendamento/tabela-agendamento.component";


@Component({
  selector: 'app-layout-default',
  imports: [MatIconModule, TabelaAgendamentoComponent],
  templateUrl: './layout-default.component.html',
  styleUrl: './layout-default.component.scss'
})
export class LayoutDefaultComponent {

}
