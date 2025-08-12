import {AfterViewInit, Component, ViewChild, OnInit} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { ButtonComponent } from "../button/button.component";
import { EditAgendamentoDialogComponent } from "../dialogs/edit-agendamento-dialog/edit-agendamento-dialog.component";
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
  AlunoId: number;
  PsicologoId: number;
}

@Component({
  selector: 'app-tabela-agendamento',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, MatButtonModule, ButtonComponent],
  templateUrl: './tabela-agendamento.component.html',
  styleUrl: './tabela-agendamento.component.scss'
})
export class TabelaAgendamentoComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['data', 'horario', 'aluno', 'psicologo', 'status', 'edit', 'info', 'excluir'];
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

        // Reconfigurar o sorting após carregar os dados
        if (this.sort) {
          this.dataSource.sort = this.sort;
          console.log('Sorting reconfigurado após carregar dados');
          console.log('Sortables disponíveis:', this.sort.sortables.size);
        }
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
      Status: agendamento.Status,
      AlunoId: agendamento.AlunoId,
      PsicologoId: agendamento.PsicologoId
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

  private converterDataParaISO(dataFormatada: string): string {
    // Se a data já está no formato ISO (YYYY-MM-DD), retorna como está
    if (dataFormatada && dataFormatada.includes('-') && dataFormatada.length === 10) {
      return dataFormatada;
    }

    // Se a data está no formato DD/MM/AAAA, converter para YYYY-MM-DD
    if (dataFormatada && dataFormatada.includes('/')) {
      const partes = dataFormatada.split('/');
      if (partes.length === 3) {
        return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    }

    return dataFormatada; // Retorna a data original se não conseguir converter
  }

      ngAfterViewInit() {
    console.log('ngAfterViewInit - Configurando paginator e sort');

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configurar ordenação customizada
    this.dataSource.sortingDataAccessor = (item, property) => {
      console.log(`Sorting property: ${property}, value:`, item[property as keyof AgendamentoDisplay]);

      switch (property) {
        case 'data':
          // Converter data para timestamp para ordenação numérica
          const dataParts = item.Data.split('/');
          if (dataParts.length === 3) {
            const timestamp = new Date(`${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`).getTime();
            console.log(`Data convertida: ${item.Data} -> ${timestamp}`);
            return timestamp;
          }
          return item.Data;
        case 'horario':
          // Converter horário para minutos para ordenação numérica
          const horarioParts = item.Horario.split(':');
          if (horarioParts.length === 2) {
            const minutos = parseInt(horarioParts[0]) * 60 + parseInt(horarioParts[1]);
            console.log(`Horário convertido: ${item.Horario} -> ${minutos} minutos`);
            return minutos;
          }
          return item.Horario;
        case 'aluno':
          const alunoLower = item.AlunoNome.toLowerCase();
          console.log(`Aluno: ${item.AlunoNome} -> ${alunoLower}`);
          return alunoLower;
        case 'psicologo':
          const psicologoLower = item.PsicologoNome.toLowerCase();
          console.log(`Psicólogo: ${item.PsicologoNome} -> ${psicologoLower}`);
          return psicologoLower;
        case 'status':
          const statusLower = item.Status.toLowerCase();
          console.log(`Status: ${item.Status} -> ${statusLower}`);
          return statusLower;
        default:
          return item[property as keyof AgendamentoDisplay];
      }
    };

    // Aguardar um tick para garantir que os sortables sejam registrados
    setTimeout(() => {
      console.log('Sortables registrados:', this.sort?.sortables.size);
      console.log('Sorting configurado com sucesso');
    }, 0);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(row: AgendamentoDisplay): void {
    console.log('Botão editar clicado para:', row);
    console.log('Tentando abrir diálogo de edição...');

    // Criar dados mock para teste
    const agendamentoMock = {
      Id: row.Id,
      AlunoId: row.AlunoId,
      PsicologoId: row.PsicologoId,
      Data: this.converterDataParaISO(row.Data), // Converter para formato ISO
      Horario: row.Horario,
      Status: row.Status as 'Pendente' | 'Confirmado' | 'Cancelado',
      Aluno: { Id: row.AlunoId, Usuario: { Nome: row.AlunoNome } },
      Psicologo: { Id: row.PsicologoId, Usuario: { Nome: row.PsicologoNome } }
    };


    try {
      console.log('Tentando abrir diálogo com dados:', {
        agendamento: {
          id: agendamentoMock.Id,
          alunoId: agendamentoMock.AlunoId,
          psicologoId: agendamentoMock.PsicologoId,
          data: agendamentoMock.Data,
          horario: agendamentoMock.Horario,
          status: agendamentoMock.Status,
          aluno: agendamentoMock.Aluno,
          psicologo: agendamentoMock.Psicologo
        }
      });

      const dialogRef = this.dialog.open(EditAgendamentoDialogComponent, {
        width: '560px',
        data: {
          agendamento: {
            id: agendamentoMock.Id,
            alunoId: agendamentoMock.AlunoId,
            psicologoId: agendamentoMock.PsicologoId,
            data: agendamentoMock.Data,
            horario: agendamentoMock.Horario,
            status: agendamentoMock.Status,
            aluno: agendamentoMock.Aluno,
            psicologo: agendamentoMock.Psicologo
          }
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {

          // Preparar dados para a API
          const dadosAtualizados = {
            Id: result.id,
            AlunoId: result.alunoId,
            PsicologoId: result.psicologoId,
            Data: result.data,
            Horario: result.horario,
            Status: result.status
          };

          console.log('Dados que serão enviados para a API:', dadosAtualizados);

          // Chamar o serviço para atualizar o agendamento
          this.agendamentosService.updateAgendamento(result.id, dadosAtualizados).subscribe({
            next: (response) => {
              console.log('Agendamento atualizado com sucesso:', response);
              alert('Agendamento atualizado com sucesso!');
              this.carregarAgendamentos();
            },
            error: (error) => {
              console.error('Erro ao atualizar agendamento:', error);
              alert('Erro ao atualizar agendamento. Tente novamente.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Erro ao abrir diálogo:', error);
      alert('Erro ao abrir diálogo de edição. Tente novamente.');
    }
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

  excluirAgendamento(agendamento: AgendamentoDisplay): void {
    const confirmacao = confirm(`Tem certeza que deseja excluir o agendamento?\n\n📅 Data: ${agendamento.Data}\n⏰ Horário: ${agendamento.Horario}\n👤 Aluno: ${agendamento.AlunoNome}\n🧠 Psicólogo: ${agendamento.PsicologoNome}\n\nEsta ação não pode ser desfeita.`);

    if (confirmacao) {
      this.agendamentosService.deleteAgendamento(agendamento.Id).subscribe({
        next: () => {
          alert('Agendamento excluído com sucesso!');
          this.carregarAgendamentos(); // Recarregar a tabela
        },
        error: (error) => {
          console.error('Erro ao excluir agendamento:', error);
          alert('Erro ao excluir agendamento. Tente novamente.');
        }
      });
    }
  }

}
