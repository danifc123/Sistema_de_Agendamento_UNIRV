import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { addMonths, subMonths } from 'date-fns'; // já vem com angular-calendar
import { FormsModule } from '@angular/forms';


registerLocaleData(localePt);
@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
  // Importante: Desabilita o encapsulamento de estilo para que os estilos globais da biblioteca funcionem
  encapsulation: ViewEncapsulation.None
})
export class CalendarioComponent{
@Input ({required : true}) tipo: "Calendario"| "Agenda" = "Calendario";

  public selectedDate: Date | null = null;
  protected view: CalendarView = CalendarView.Month;
  protected viewDate: Date = new Date();

  // --- Agenda (variação customizada) ---
  public weekDays: string[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  public monthDays: Array<{ date: Date; inCurrentMonth: boolean; isToday: boolean }>= [];
  public panelOpen: boolean = false;
  public noteText: string = '';

  private notesStoreKey: string = 'agendaNotes';
  private notesMap: Record<string, string> = {};

  constructor() {
    this.loadNotesFromStorage();
    this.buildMonthDays();
  }

  // Número de semanas (linhas) no mês atual exibido
  // Gera a grade do mês considerando que a semana inicia na segunda-feira
  protected buildMonthDays(): void {
    const currentYear = this.viewDate.getFullYear();
    const currentMonth = this.viewDate.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = endOfMonth.getDate();
    // Ajusta para semana começando na segunda: 0=Seg ... 6=Dom
    const startWeekDay = (startOfMonth.getDay() + 6) % 7;

    const firstDateInGrid = new Date(startOfMonth);
    firstDateInGrid.setDate(1 - startWeekDay);

    const totalCells = (() => {
      const base = startWeekDay + daysInMonth;
      return base % 7 === 0 ? base : base + (7 - (base % 7));
    })();

    const today = this.stripTime(new Date());

    const days: Array<{ date: Date; inCurrentMonth: boolean; isToday: boolean }> = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(firstDateInGrid);
      date.setDate(firstDateInGrid.getDate() + i);
      const inCurrent = date.getMonth() === currentMonth;
      const isToday = this.isSameDate(date, today);
      days.push({ date, inCurrentMonth: inCurrent, isToday });
    }

    this.monthDays = days;
  }

  public openDayPanel(day: { date: Date } | Date): void {
    const date = day instanceof Date ? day : day.date;
    this.selectedDate = date;
    this.noteText = this.getNote(date) ?? '';
    this.panelOpen = true;
  }

  public closePanel(): void {
    this.panelOpen = false;
  }

  public saveNote(): void {
    if (!this.selectedDate) return;
    const key = this.formatDateKey(this.selectedDate);
    const value = (this.noteText || '').trim();

    if (value.length === 0) {
      delete this.notesMap[key];
    } else {
      this.notesMap[key] = value;
    }
    this.persistNotesToStorage();
    this.panelOpen = false;
  }

  public deleteNote(): void {
    if (!this.selectedDate) return;
    const key = this.formatDateKey(this.selectedDate);
    delete this.notesMap[key];
    this.persistNotesToStorage();
    this.noteText = '';
  }

  public hasNote(date: Date | null): boolean {
    if (!date) return false;
    const key = this.formatDateKey(date);
    return typeof this.notesMap[key] === 'string' && this.notesMap[key].trim().length > 0;
  }

  protected getNote(date: Date | null): string | undefined {
    if (!date) return undefined;
    return this.notesMap[this.formatDateKey(date)];
  }

  protected isSameDate(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private loadNotesFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.notesStoreKey);
      this.notesMap = raw ? JSON.parse(raw) : {};
    } catch {
      this.notesMap = {};
    }
  }

  private persistNotesToStorage(): void {
    try {
      localStorage.setItem(this.notesStoreKey, JSON.stringify(this.notesMap));
    } catch {
      // ignore
    }
  }

  onDayClicked(date: Date): void {
  this.selectedDate = date;
}

  previousMonth(): void {
  this.viewDate = subMonths(this.viewDate, 1);
  this.selectedDate = null; // opcional: desmarca data ao trocar o mês
  this.buildMonthDays();
}
nextMonth(): void {
  this.viewDate = addMonths(this.viewDate, 1);
  this.selectedDate = null;
  this.buildMonthDays();
}
}
