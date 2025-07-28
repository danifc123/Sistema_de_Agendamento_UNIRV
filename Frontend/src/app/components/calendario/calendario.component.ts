import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  // Importante: Desabilita o encapsulamento de estilo para que os estilos globais da biblioteca funcionem
  encapsulation: ViewEncapsulation.None
})
export class CalendarioComponent implements OnInit {
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();

  // Configuração do locale para o calendário (opcional, mas bom para português)
  locale: string = 'pt';

  constructor() {}

  ngOnInit(): void {
    // Você pode adicionar lógica de inicialização aqui se precisar
  }
}
