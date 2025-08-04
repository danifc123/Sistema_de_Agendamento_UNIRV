import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { addMonths, subMonths } from 'date-fns'; // já vem com angular-calendar


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
export class CalendarioComponent{
@Input ({required : true}) tipo: "Calendario"| "Agenda" = "Calendario";

  protected selectedDate: Date | null = null;
  protected view: CalendarView = CalendarView.Month;
  protected viewDate: Date = new Date();


  onDayClicked(date: Date): void {
  this.selectedDate = date;
}

  previousMonth(): void {
  this.viewDate = subMonths(this.viewDate, 1);
  this.selectedDate = null; // opcional: desmarca data ao trocar o mês
}
nextMonth(): void {
  this.viewDate = addMonths(this.viewDate, 1);
  this.selectedDate = null;
}
}
