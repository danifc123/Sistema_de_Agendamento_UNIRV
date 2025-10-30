import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DisponibilidadesService, Disponibilidade } from '../../services/disponibilidades.service';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../components/button/button.component';
import { SelectComponent } from '../../components/select/select.component';

@Component({
  selector: 'app-gerenciar-bloqueios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    ButtonComponent,
    SelectComponent
  ],
  templateUrl: './gerenciar-bloqueios.component.html',
  styleUrl: './gerenciar-bloqueios.component.scss'
})
export class GerenciarBloqueiosComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Disponibilidade>([]);
  displayedColumns: string[] = ['data', 'diaSemana', 'horaInicio', 'horaFim', 'editar', 'excluir'];

  isLoading: boolean = false;
  psicologoId: number | null = null;

  // Filtro por dia da semana
  diaSemanaFiltro: string = '';
  todosBloqueios: Disponibilidade[] = [];
  diasSemanaOpcoes = [
    { value: '', label: 'Todos os dias' },
    { value: 'Domingo', label: 'Domingo' },
    { value: 'Segunda-feira', label: 'Segunda-feira' },
    { value: 'Terça-feira', label: 'Terça-feira' },
    { value: 'Quarta-feira', label: 'Quarta-feira' },
    { value: 'Quinta-feira', label: 'Quinta-feira' },
    { value: 'Sexta-feira', label: 'Sexta-feira' },
    { value: 'Sábado', label: 'Sábado' }
  ];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private disponibilidadesService: DisponibilidadesService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user?.Id) {
      this.psicologoId = user.Id;
      this.carregarBloqueios();
    } else {
      alert('Usuário não identificado. Faça login novamente.');
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private carregarBloqueios(): void {
    if (!this.psicologoId) return;

    this.isLoading = true;
    this.disponibilidadesService.listarPorPsicologo(this.psicologoId).subscribe({
      next: (bloqueios) => {
        this.todosBloqueios = bloqueios || [];
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Erro ao carregar bloqueios.';
        alert(msg);
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.diaSemanaFiltro) {
      this.dataSource.data = this.todosBloqueios;
    } else {
      this.dataSource.data = this.todosBloqueios.filter(bloqueio =>
        this.obterDiaSemana(bloqueio.Data) === this.diaSemanaFiltro
      );
    }
  }

  onFiltrarDiaSemana(): void {
    this.aplicarFiltro();
  }

  formatarData(dataStr: string): string {
    if (!dataStr) return '';

    // Se a data vem no formato YYYY-MM-DD
    const partes = dataStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return dataStr;
  }

  obterDiaSemana(dataStr: string): string {
    if (!dataStr) return '';

    const data = new Date(dataStr + 'T00:00:00');
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    return diasSemana[data.getDay()];
  }

  private isPastDateTime(data: string, horaInicio: string): boolean {
    const dataHoraStr = `${data}T${horaInicio}`;
    const dataHora = new Date(dataHoraStr);
    const agora = new Date();
    return dataHora < agora;
  }

  onEditar(bloqueio: Disponibilidade): void {
    if (this.isPastDateTime(bloqueio.Data, bloqueio.HoraInicio)) {
      alert('Não é possível editar bloqueios com data/hora que já passou.');
      return;
    }

    const novaData = prompt('Nova data (formato: DD/MM/YYYY):', this.formatarData(bloqueio.Data));
    if (novaData === null) return;

    const novaHoraInicio = prompt('Nova hora de início (formato: HH:mm):', bloqueio.HoraInicio);
    if (novaHoraInicio === null) return;

    const novaHoraFim = prompt('Nova hora de fim (formato: HH:mm):', bloqueio.HoraFim);
    if (novaHoraFim === null) return;

    if (!novaData.trim() || !novaHoraInicio.trim() || !novaHoraFim.trim()) {
      alert('Todos os campos são obrigatórios.');
      return;
    }

    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    let dataFormatada = '';
    const partesData = novaData.trim().split('/');
    if (partesData.length === 3) {
      const dia = partesData[0].padStart(2, '0');
      const mes = partesData[1].padStart(2, '0');
      const ano = partesData[2];
      dataFormatada = `${ano}-${mes}-${dia}`;
    } else {
      alert('Formato de data inválido. Use DD/MM/YYYY');
      return;
    }

    // Validar formato de hora
    const regexHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHora.test(novaHoraInicio.trim()) || !regexHora.test(novaHoraFim.trim())) {
      alert('Formato de hora inválido. Use HH:mm (exemplo: 08:00)');
      return;
    }

    const payload = {
      PsicologoId: bloqueio.PsicologoId,
      Data: dataFormatada,
      HoraInicio: novaHoraInicio.trim(),
      HoraFim: novaHoraFim.trim()
    };

    this.disponibilidadesService.atualizarBloqueio(bloqueio.Id, payload).subscribe({
      next: () => {
        alert('Bloqueio atualizado com sucesso!');
        this.carregarBloqueios();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao atualizar bloqueio.';
        alert(msg);
      }
    });
  }

  onExcluir(bloqueio: Disponibilidade): void {
    if (this.isPastDateTime(bloqueio.Data, bloqueio.HoraInicio)) {
      alert('Não é possível excluir bloqueios com data/hora que já passou.');
      return;
    }

    const dataFormatada = this.formatarData(bloqueio.Data);
    const diaSemana = this.obterDiaSemana(bloqueio.Data);
    const confirmar = confirm(`Deseja excluir o bloqueio do dia ${dataFormatada} (${diaSemana}) de ${bloqueio.HoraInicio} até ${bloqueio.HoraFim}?`);
    if (!confirmar) return;

    this.disponibilidadesService.deletarBloqueio(bloqueio.Id).subscribe({
      next: () => {
        alert('Bloqueio excluído com sucesso!');
        this.carregarBloqueios();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erro ao excluir bloqueio.';
        alert(msg);
      }
    });
  }

  podeEditarOuExcluir(bloqueio: Disponibilidade): boolean {
    return !this.isPastDateTime(bloqueio.Data, bloqueio.HoraInicio);
  }
}

