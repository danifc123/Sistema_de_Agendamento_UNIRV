import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AgendamentosService, Agendamento } from '../../services/agendamentos.service';

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
export class RelatoriosADMComponent implements OnInit {
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

  public displayedColumns: string[] = ['date', 'time', 'student', 'psychologist', 'status'];
  public filteredAppointments: Appointment[] = [];
  public allAppointments: Appointment[] = [];

  constructor(private agendamentosService: AgendamentosService) {}

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    this.agendamentosService.getAgendamentos().subscribe({
      next: (agendamentos) => {
        this.allAppointments = this.converterAgendamentosParaAppointments(agendamentos);
        this.updateFilteredAppointments();
        console.log('Agendamentos carregados:', agendamentos);
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
      }
    });
  }

  private converterAgendamentosParaAppointments(agendamentos: Agendamento[]): Appointment[] {
    return agendamentos.map(agendamento => ({
      id: agendamento.Id.toString(),
      studentName: `Aluno ${agendamento.AlunoId}`, // TODO: Buscar nome real do aluno
      psychologistName: `Psicólogo ${agendamento.PsicologoId}`, // TODO: Buscar nome real do psicólogo
      date: new Date(agendamento.Data),
      time: agendamento.Horario,
      notes: agendamento.Status
    }));
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
      a.psychologistName,
      a.notes || ''
    ]);

    autoTable(doc, {
      startY: 60,
      head: [[ 'Data', 'Hora', 'Aluno', 'Psicólogo', 'Status' ]],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 60 },
        2: { cellWidth: 150 },
        3: { cellWidth: 150 },
        4: { cellWidth: 'auto' },
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
}
