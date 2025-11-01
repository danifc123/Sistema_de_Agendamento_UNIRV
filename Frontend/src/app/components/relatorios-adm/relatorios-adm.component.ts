import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AgendamentosService, Agendamento } from '../../services/agendamentos.service';
import { AlunosService } from '../../services/alunos.service';

export interface Appointment {
  id: string;
  studentName: string;
  psychologistName: string;
  date: Date;
  time: string; // HH:mm
  notes?: string;
}

interface AlunoOption {
  id: number;
  nome: string;
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
    MatInputModule,
  ],
  templateUrl: './relatorios-adm.component.html',
  styleUrl: './relatorios-adm.component.scss'
})
export class RelatoriosADMComponent implements OnInit {
  public readonly monthOptions: { value: number; label: string }[] = [
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

  // Filtro de Aluno
  public alunos: AlunoOption[] = [];
  public alunosFiltrados: AlunoOption[] = [];
  public buscaAluno: string = '';
  public alunoSelecionadoId: number | null = null;
  public alunoSelecionadoNome: string = '';
  public mostrarListaAlunos: boolean = false;

  constructor(
    private agendamentosService: AgendamentosService,
    private alunosService: AlunosService
  ) {}

  ngOnInit(): void {
    this.carregarAlunos();
    this.carregarAgendamentos();
  }

  carregarAlunos(): void {
    this.alunosService.getAlunos().subscribe({
      next: (alunos) => {
        this.alunos = alunos
          .filter(a => !!a.Usuario?.Nome)
          .map(a => ({ id: a.Id, nome: a.Usuario!.Nome }))
          .sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: (error) => {
        console.error('Erro ao carregar alunos:', error);
      }
    });
  }

  onBuscaAlunoChange(busca: string): void {
    this.buscaAluno = busca;

    if (!busca.trim()) {
      this.alunosFiltrados = [];
      this.mostrarListaAlunos = false;
      return;
    }

    const buscaLower = busca.toLowerCase();
    this.alunosFiltrados = this.alunos.filter(a =>
      a.nome.toLowerCase().includes(buscaLower)
    );
    this.mostrarListaAlunos = this.alunosFiltrados.length > 0;
  }

  selecionarAluno(aluno: AlunoOption): void {
    this.alunoSelecionadoId = aluno.id;
    this.alunoSelecionadoNome = aluno.nome;
    this.buscaAluno = aluno.nome;
    this.mostrarListaAlunos = false;
    this.alunosFiltrados = [];
    this.updateFilteredAppointments();
  }

  limparFiltroAluno(): void {
    this.alunoSelecionadoId = null;
    this.alunoSelecionadoNome = '';
    this.buscaAluno = '';
    this.alunosFiltrados = [];
    this.mostrarListaAlunos = false;
    this.updateFilteredAppointments();
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
    console.log('Convertendo agendamentos:', agendamentos);

    return agendamentos.map(agendamento => {
      const studentName = agendamento.Aluno?.Usuario?.Nome || `Aluno ${agendamento.AlunoId}`;
      const psychologistName = agendamento.Psicologo?.Usuario?.Nome || `Psicólogo ${agendamento.PsicologoId}`;

      console.log(`Agendamento ${agendamento.Id}: Aluno=${studentName}, Psicólogo=${psychologistName}`);

      return {
        id: agendamento.Id.toString(),
        studentName: studentName,
        psychologistName: psychologistName,
        date: new Date(agendamento.Data),
        time: agendamento.Horario,
        notes: agendamento.Status
      };
    });
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
    let title = `Relatório de Agendamentos - ${monthLabel}/${this.selectedYear}`;

    // Adiciona nome do aluno ao título se filtrado
    if (this.alunoSelecionadoId !== null) {
      title += ` - Aluno: ${this.alunoSelecionadoNome}`;
    }

    // Título principal
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 40, 40);

    // Informações do relatório
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de agendamentos: ${this.filteredAppointments.length}`, 40, 60);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 40, 75);

    if (this.filteredAppointments.length === 0) {
      doc.setFontSize(12);
      doc.text('Nenhum agendamento encontrado para o período selecionado.', 40, 100);
    } else {
      const rows = this.filteredAppointments.map(a => [
        a.date.toLocaleDateString('pt-BR'),
        a.time,
        a.studentName,
        a.psychologistName,
        this.getStatusLabel(a.notes || '')
      ]);

      autoTable(doc, {
        startY: 100,
        head: [[ 'Data', 'Hora', 'Aluno', 'Psicólogo', 'Status' ]],
        body: rows,
        styles: { fontSize: 9 },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 50 },
          2: { cellWidth: 120 },
          3: { cellWidth: 120 },
          4: { cellWidth: 60 },
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        }
      });
    }

    const fileName = `relatorio-agendamentos-${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}.pdf`;
    doc.save(fileName);
  }

  private getStatusLabel(status: string): string {
    switch (status) {
      case 'Pendente': return 'Pendente';
      case 'Confirmado': return 'Confirmado';
      case 'Cancelado': return 'Cancelado';
      default: return status;
    }
  }

  private updateFilteredAppointments(): void {
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      const isSameMonth = appointment.date.getMonth() + 1 === this.selectedMonth;
      const isSameYear = appointment.date.getFullYear() === this.selectedYear;

      // Filtro por aluno (se selecionado)
      const matchAluno = this.alunoSelecionadoId === null ||
                         appointment.studentName === this.alunoSelecionadoNome;

      return isSameMonth && isSameYear && matchAluno;
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
