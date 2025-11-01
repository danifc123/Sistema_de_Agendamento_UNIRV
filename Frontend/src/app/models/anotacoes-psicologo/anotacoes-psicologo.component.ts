import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { AlunosService } from '../../services/alunos.service';
import { AnotacoesService, Anotacao } from '../../services/anotacoes.service';
import { AuthService, UserInfo } from '../../services/auth.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InfoAnotacaoDialogComponent } from './info-anotacao-dialog/info-anotacao-dialog.component';
import { EditarAnotacaoDialogComponent } from './editar-anotacao-dialog/editar-anotacao-dialog.component';

interface AlunoOption {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-anotacoes-psicologo',
  standalone: true,
  imports: [CommonModule, FormsModule, InputComponent, ButtonComponent, MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './anotacoes-psicologo.component.html',
  styleUrl: './anotacoes-psicologo.component.scss'
})
export class AnotacoesPsicologoComponent implements OnInit, AfterViewInit {
  alunos: AlunoOption[] = [];
  alunosFiltrados: AlunoOption[] = [];
  alunoSelecionadoId: string = '';
  alunoSelecionadoNome: string = '';
  nomeAlunoBusca: string = '';
  mostrarLista: boolean = false;

  dataSource = new MatTableDataSource<Anotacao>([]);
  displayedColumns: string[] = ['data', 'diaSemana', 'acoes'];

  descricaoNovaNota: string = '';
  dataNota: string = '';

  currentUser: UserInfo | null = null;

  isLoading: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private alunosService: AlunosService,
    private anotacoesService: AnotacoesService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.carregarAlunos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'data':
          return item.Data;
        case 'aluno':
          return this.alunoSelecionadoNome.toLowerCase();
        default:
          return (item as any)[property];
      }
    };
  }

  private carregarAlunos(): void {
    this.alunosService.getAlunos().subscribe({
      next: (lista) => {
        this.alunos = (lista || [])
          .filter(a => !!a.Usuario?.Nome)
          .map(a => ({ id: a.Id, nome: a.Usuario!.Nome }));
      },
      error: () => {
        alert('Erro ao carregar alunos.');
      }
    });
  }

  onBuscaAlunoChange(nome: string): void {
    this.nomeAlunoBusca = nome;

    if (!nome.trim()) {
      this.alunosFiltrados = [];
      this.mostrarLista = false;
      this.alunoSelecionadoId = '';
      this.alunoSelecionadoNome = '';
      this.dataSource.data = [];
      return;
    }

    // Filtrar alunos pelo nome
    const nomeLower = nome.toLowerCase();
    this.alunosFiltrados = this.alunos.filter(a =>
      a.nome.toLowerCase().includes(nomeLower)
    );
    this.mostrarLista = this.alunosFiltrados.length > 0;
  }

  selecionarAluno(aluno: AlunoOption): void {
    this.alunoSelecionadoId = aluno.id.toString();
    this.alunoSelecionadoNome = aluno.nome;
    this.nomeAlunoBusca = aluno.nome;
    this.mostrarLista = false;
    this.alunosFiltrados = [];
    this.carregarNotas();
  }

  private carregarNotas(): void {
    const alunoId = parseInt(this.alunoSelecionadoId, 10);
    if (!alunoId) { this.dataSource.data = []; return; }

    this.isLoading = true;
    this.anotacoesService.getAnotacoesPorAluno(alunoId).subscribe({
      next: (notas) => {
        this.dataSource.data = notas || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Erro ao carregar anotações.');
      }
    });
  }

  criarNota(): void {
    const alunoId = parseInt(this.alunoSelecionadoId, 10);
    if (!alunoId) { alert('Selecione um aluno.'); return; }
    if (!this.descricaoNovaNota?.trim()) { alert('Escreva a anotação.'); return; }
    if (!this.dataNota) { alert('Selecione a data.'); return; }

    const psicologoId = this.currentUser?.Id;
    if (!psicologoId) { alert('Usuário inválido. Faça login novamente.'); return; }

    const payload: Anotacao = {
      AlunoId: alunoId,
      PsicologoId: psicologoId,
      Descricao: this.descricaoNovaNota.trim(),
      Data: this.dataNota
    };

    this.anotacoesService.criarAnotacao(payload).subscribe({
      next: () => {
        this.descricaoNovaNota = '';
        this.dataNota = '';
        this.carregarNotas();
      },
      error: (err) => {
        const msg = err?.error?.Message || err?.error?.message || 'Erro ao salvar anotação.';
        alert(msg);
      }
    });
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

  onInfo(nota: Anotacao): void {
    const dataFormatada = this.formatarData(nota.Data);
    const diaSemana = this.obterDiaSemana(nota.Data);

    this.dialog.open(InfoAnotacaoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'info-anotacao-dialog',
      data: {
        alunoNome: this.alunoSelecionadoNome,
        data: dataFormatada,
        diaSemana: diaSemana,
        descricao: nota.Descricao
      }
    });
  }

  onEditar(nota: Anotacao): void {
    if (!nota?.Id) return;

    const dataFormatada = this.formatarData(nota.Data);

    const dialogRef = this.dialog.open(EditarAnotacaoDialogComponent, {
      width: '650px',
      maxWidth: '95vw',
      panelClass: 'editar-anotacao-dialog',
      data: {
        alunoNome: this.alunoSelecionadoNome,
        data: dataFormatada,
        descricao: nota.Descricao
      }
    });

    dialogRef.afterClosed().subscribe((novaDescricao) => {
      if (novaDescricao) {
        const editada: Anotacao = { ...nota, Descricao: novaDescricao };
        this.anotacoesService.atualizarAnotacao(nota.Id!, editada).subscribe({
          next: () => this.carregarNotas(),
          error: () => alert('Erro ao atualizar anotação.')
        });
      }
    });
  }

  onExcluir(nota: Anotacao): void {
    if (!nota?.Id) return;
    const ok = confirm('Deseja excluir esta anotação?');
    if (!ok) return;
    this.anotacoesService.deletarAnotacao(nota.Id).subscribe({
      next: () => this.carregarNotas(),
      error: (err) => {
        const msg = err?.error?.Message || err?.error?.message || 'Erro ao excluir anotação.';
        alert(msg);
      }
    });
  }
}
