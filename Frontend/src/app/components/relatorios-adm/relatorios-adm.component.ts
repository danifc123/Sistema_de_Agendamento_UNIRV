import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Appointment {
  id: string;
  studentName: string;
  psychologistName: string;
  date: Date;
  time: string; // HH:mm
  notes?: string;
}

@Component({
  selector: 'app-relatorios-adm',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './relatorios-adm.component.html',
  styleUrl: './relatorios-adm.component.scss'
})
export class RelatoriosADMComponent {
  public readonly monthOptions: Array<{ value: number; label: string }> = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  public readonly yearOptions: number[] = this.generateYearRange();

  public selectedMonth: number = new Date().getMonth() + 1; // 1-12
  public selectedYear: number = new Date().getFullYear();

  public displayedColumns: string[] = ['date', 'time', 'student', 'psychologist'];
  public filteredAppointments: Appointment[] = [];

  private readonly allAppointments: Appointment[] = this.generateMockAppointments();

  constructor() {
    this.updateFilteredAppointments();
  }

  public onMonthChange(month: number): void {
    this.selectedMonth = Number(month);
    this.updateFilteredAppointments();
  }

  public onYearChange(year: number): void {
    this.selectedYear = Number(year);
    this.updateFilteredAppointments();
  }

  public exportToPdf(): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const monthLabel = this.monthOptions.find(m => m.value === this.selectedMonth)?.label ?? '';
    const title = `Relatório de Agendamentos - ${monthLabel}/${this.selectedYear}`;

    doc.setFontSize(14);
    doc.text(title, 40, 40);

    const rows = this.filteredAppointments.map(a => [
      a.date.toLocaleDateString('pt-BR'),
      a.time,
      a.studentName,
      a.psychologistName
    ]);

    autoTable(doc, {
      startY: 60,
      head: [[ 'Data', 'Hora', 'Aluno', 'Psicólogo' ]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 200 },
        3: { cellWidth: 'auto' },
      }
    });

    const fileName = `relatorio-agendamentos-${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}.pdf`;
    doc.save(fileName);
  }

  private updateFilteredAppointments(): void {
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      const isSameMonth = appointment.date.getMonth() + 1 === this.selectedMonth;
      const isSameYear = appointment.date.getFullYear() === this.selectedYear;
      return isSameMonth && isSameYear;
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private generateYearRange(): number[] {
    const currentYear = new Date().getFullYear();
    const range: number[] = [];
    for (let year = currentYear - 2; year <= currentYear + 2; year++) {
      range.push(year);
    }
    return range;
  }

  private generateMockAppointments(): Appointment[] {
    const baseYear = new Date().getFullYear();
    return [
      { id: '1', studentName: 'Ana Silva', psychologistName: 'Dr(a). Paula Souza', date: new Date(baseYear, 0, 10), time: '09:00', notes: 'Retorno' },
      { id: '2', studentName: 'Bruno Lima', psychologistName: 'Dr(a). Carlos Mendes', date: new Date(baseYear, 0, 15), time: '10:30' },
      { id: '3', studentName: 'Carla Rocha', psychologistName: 'Dr(a). Paula Souza', date: new Date(baseYear, 1, 3), time: '14:00' },
      { id: '4', studentName: 'Diego Santos', psychologistName: 'Dr(a). João Pereira', date: new Date(baseYear, 1, 21), time: '16:15', notes: 'Primeira consulta' },
      { id: '5', studentName: 'Eduarda Melo', psychologistName: 'Dr(a). João Pereira', date: new Date(baseYear, 6, 7), time: '11:00' },
      { id: '6', studentName: 'Fernanda Alves', psychologistName: 'Dr(a). Paula Souza', date: new Date(baseYear, 6, 18), time: '13:30', notes: 'Encaminhamento' },
      { id: '7', studentName: 'Gustavo Nunes', psychologistName: 'Dr(a). Carlos Mendes', date: new Date(baseYear, 7, 1), time: '09:45' },
      { id: '8', studentName: 'Helena Dias', psychologistName: 'Dr(a). Paula Souza', date: new Date(baseYear, 7, 22), time: '15:00' },
      { id: '9', studentName: 'Igor Martins', psychologistName: 'Dr(a). João Pereira', date: new Date(baseYear, 10, 5), time: '10:00' },
      { id: '10', studentName: 'Juliana Castro', psychologistName: 'Dr(a). Paula Souza', date: new Date(baseYear, 11, 12), time: '08:30', notes: 'Alta' },
    ];
  }
}
