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
  alunoSelecionadoId: string = '';
  alunoSelecionadoNome: string = '';

  dataSource = new MatTableDataSource<Anotacao>([]);
  displayedColumns: string[] = ['data', 'aluno', 'info', 'editar', 'excluir'];

  descricaoNovaNota: string = '';
  dataNota: string = '';

  currentUser: UserInfo | null = null;

  isLoading: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private alunosService: AlunosService,
    private anotacoesService: AnotacoesService,
    private authService: AuthService
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

  onAlunoChange(idStr: string): void {
    this.alunoSelecionadoId = idStr;
    const aluno = this.alunos.find(a => a.id === parseInt(idStr, 10));
    this.alunoSelecionadoNome = aluno?.nome || '';
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

  onInfo(nota: Anotacao): void {
    alert(`Aluno: ${this.alunoSelecionadoNome}\nData: ${nota.Data}\n\n${nota.Descricao}`);
  }

  onEditar(nota: Anotacao): void {
    if (!nota?.Id) return;
    const nova = prompt('Editar anotação:', nota.Descricao);
    if (nova === null) return;
    const trimmed = (nova || '').trim();
    if (!trimmed) { alert('A descrição não pode ficar vazia.'); return; }

    const editada: Anotacao = { ...nota, Descricao: trimmed };
    this.anotacoesService.atualizarAnotacao(nota.Id, editada).subscribe({
      next: () => this.carregarNotas(),
      error: () => alert('Erro ao atualizar anotação.')
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
