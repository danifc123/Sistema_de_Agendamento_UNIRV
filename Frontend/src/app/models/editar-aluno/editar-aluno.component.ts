import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ButtonComponent } from "../../components/button/button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarAlunoDialogComponent } from './editar-aluno-dialog/editar-aluno-dialog.component';
import { AlunosService, Aluno } from '../../services/alunos.service';
import { CommonModule } from '@angular/common';

// Interface para exibição na tabela
export interface AlunoDisplay {
  Id: number;
  Nome: string;
  Email: string;
  Matricula: string;
  Curso: string;
  Semestre: string;
}

@Component({
  selector: 'app-editar-aluno',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, MatButtonModule, ButtonComponent],
  templateUrl: './editar-aluno.component.html',
  styleUrl: './editar-aluno.component.scss'
})
export class EditarAlunoComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['id', 'nome', 'email', 'matricula', 'curso', 'semestre', 'acoes'];
  dataSource: MatTableDataSource<AlunoDisplay>;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private alunosService: AlunosService
  ) {
    this.dataSource = new MatTableDataSource<AlunoDisplay>([]);
  }

  ngOnInit(): void {
    this.carregarAlunos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Definir o tamanho da página para mostrar poucos itens sem scroll
    if (this.paginator) {
      this.paginator.pageSize = 5;
      this.paginator._changePageSize(5);
    }

    // Configurar ordenação customizada
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'id':
          return item.Id;
        case 'nome':
          return item.Nome.toLowerCase();
        case 'email':
          return item.Email.toLowerCase();
        case 'matricula':
          return item.Matricula.toLowerCase();
        case 'curso':
          return item.Curso.toLowerCase();
        case 'semestre':
          return item.Semestre.toLowerCase();
        default:
          return item[property as keyof AlunoDisplay];
      }
    };

    // Configurar filtro customizado para buscar em múltiplos campos
    this.dataSource.filterPredicate = (data: AlunoDisplay, filter: string) => {
      const searchStr = filter.toLowerCase();

      // Buscar em todos os campos relevantes
      return data.Id.toString().includes(searchStr) ||
             data.Nome.toLowerCase().includes(searchStr) ||
             data.Email.toLowerCase().includes(searchStr) ||
             data.Matricula.toLowerCase().includes(searchStr) ||
             data.Curso.toLowerCase().includes(searchStr) ||
             data.Semestre.toLowerCase().includes(searchStr);
    };
  }

  carregarAlunos(): void {
    this.alunosService.getAlunos().subscribe({
      next: (alunos) => {
        const alunosDisplay = this.converterParaDisplay(alunos);
        this.dataSource.data = alunosDisplay;
      },
      error: (error) => {
        console.error('Erro ao carregar alunos:', error);
      }
    });
  }

  private converterParaDisplay(alunos: Aluno[]): AlunoDisplay[] {
    return alunos.map(aluno => ({
      Id: aluno.Id,
      Nome: aluno.Usuario?.Nome || 'Nome não disponível',
      Email: aluno.Usuario?.Email || 'Email não disponível',
      Matricula: aluno.Matricula,
      Curso: aluno.Curso,
      Semestre: aluno.Semestre.toString()
    }));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(input: HTMLInputElement) {
    input.value = '';
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editarAluno(aluno: AlunoDisplay): void {

    const dialogRef = this.dialog.open(EditarAlunoDialogComponent, {
      width: '500px',
      data: {
        aluno: {
          id: aluno.Id.toString(),
          nome: aluno.Nome,
          email: aluno.Email,
          matricula: aluno.Matricula,
          curso: aluno.Curso,
          semestre: aluno.Semestre
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recarregar dados da tabela para garantir sincronização com o banco
        this.carregarAlunos();
      }
    });
  }

    excluirAluno(aluno: AlunoDisplay): void {
    const confirmacao = confirm(`Tem certeza que deseja excluir o aluno "${aluno.Nome}"?\n\n⚠️ ATENÇÃO: Esta ação irá excluir:\n• Todos os agendamentos do aluno\n• Todas as anotações do aluno\n• Todos os formulários de solicitação do aluno\n• O cadastro completo do aluno\n\nEsta ação não pode ser desfeita.`);

    if (confirmacao) {
      this.alunosService.deleteAluno(aluno.Id).subscribe({
        next: () => {
          alert('Aluno excluído com sucesso!\n\nTodos os dados relacionados foram removidos.');
          this.carregarAlunos(); // Recarregar a tabela
        },
        error: (error) => {
          console.error('Erro ao excluir aluno:', error);
          alert('Erro ao excluir aluno. Verifique se não há dados dependentes ou tente novamente.');
        }
      });
    }
  }
}
