import {AfterViewInit, Component, ViewChild, OnInit} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ButtonComponent } from "../button/button.component";
import { MatDialog } from '@angular/material/dialog';
import { EditAlunoDialogComponent } from "../dialogs/edit-aluno-dialog/edit-aluno-dialog.component";
import { InfoAgendamentoDialogComponent } from "../dialogs/info-agendamento-dialog/info-agendamento-dialog.component";
import { AgendamentosService, Agendamento } from '../../services/agendamentos.service';
import { CommonModule } from '@angular/common';

export interface AgendamentoDisplay {
  Id: number;
  Data: string;
  Horario: string;
  AlunoNome: string;
  PsicologoNome: string;
  Status: string;
}

@Component({
  selector: 'app-tabela-agendamento',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, ButtonComponent],
  templateUrl: './tabela-agendamento.component.html',
  styleUrl: './tabela-agendamento.component.scss'
})
export class TabelaAgendamentoComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['data', 'horario', 'aluno', 'psicologo', 'status', 'edit', 'info'];
  dataSource: MatTableDataSource<AgendamentoDisplay>;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private agendamentosService: AgendamentosService
  ) {
    this.dataSource = new MatTableDataSource<AgendamentoDisplay>([]);
  }

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  carregarAgendamentos(): void {
    this.agendamentosService.getAgendamentos().subscribe({
      next: (agendamentos) => {
        const agendamentosDisplay = this.converterParaDisplay(agendamentos);
        this.dataSource.data = agendamentosDisplay;
        console.log('Agendamentos carregados na tabela:', agendamentosDisplay);
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
      }
    });
  }

  private converterParaDisplay(agendamentos: Agendamento[]): AgendamentoDisplay[] {
    return agendamentos.map(agendamento => ({
      Id: agendamento.Id,
      Data: this.formatarData(agendamento.Data),
      Horario: this.formatarHorario(agendamento.Horario),
      AlunoNome: agendamento.Aluno?.Usuario?.Nome || `Aluno ${agendamento.AlunoId}`,
      PsicologoNome: agendamento.Psicologo?.Usuario?.Nome || `Psicólogo ${agendamento.PsicologoId}`,
      Status: agendamento.Status
    }));
  }

  private formatarData(dataISO: string): string {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatarHorario(horario: string): string {
    // Se o horário já está no formato HH:MM, retorna como está
    if (horario && horario.includes(':')) {
      const partes = horario.split(':');
      if (partes.length >= 2) {
        return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
      }
    }
    return horario; // Retorna o horário original se não conseguir formatar
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(row: AgendamentoDisplay): void {
    const dialogRef = this.dialog.open(EditAlunoDialogComponent, {
      width: '560px',
      data: {
        student: { id: row.Id.toString(), name: row.AlunoNome },
        psychologist: { id: row.Id.toString(), name: row.PsicologoNome },
        appointment: { date: row.Data, time: row.Horario, notes: row.Status }
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // TODO: Implementar atualização do agendamento
        console.log('Dados atualizados:', result);
        this.carregarAgendamentos(); // Recarregar dados
      }
    });
  }

  onInfo(row: AgendamentoDisplay): void {
    this.dialog.open(InfoAgendamentoDialogComponent, {
      width: '520px',
      data: {
        student: { id: row.Id.toString(), name: row.AlunoNome },
        psychologist: { id: row.Id.toString(), name: row.PsicologoNome },
        appointment: {
          date: row.Data,
          time: row.Horario,
          notes: `Status: ${row.Status}`
        }
      }
    });
  }

  // Método público para recarregar dados (pode ser chamado pelo componente pai)
  recarregarDados(): void {
    this.carregarAgendamentos();
  }
}
