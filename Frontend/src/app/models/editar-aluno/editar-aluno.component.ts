import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from "../../components/button/button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarAlunoDialogComponent } from './editar-aluno-dialog/editar-aluno-dialog.component';

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  curso: string;
  semestre: string;
}

@Component({
  selector: 'app-editar-aluno',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, ButtonComponent],
  templateUrl: './editar-aluno.component.html',
  styleUrl: './editar-aluno.component.scss'
})
export class EditarAlunoComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'nome', 'email', 'matricula', 'curso', 'semestre', 'editar'];
  dataSource: MatTableDataSource<Aluno>;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private dialog: MatDialog) {
    // Dados simulados de alunos
    const alunos = [
      { id: '1', nome: 'João Silva', email: 'joao.silva@email.com', matricula: '2024001', curso: 'Engenharia de Software', semestre: '3º' },
      { id: '2', nome: 'Maria Santos', email: 'maria.santos@email.com', matricula: '2024002', curso: 'Ciência da Computação', semestre: '5º' },
      { id: '3', nome: 'Pedro Costa', email: 'pedro.costa@email.com', matricula: '2024003', curso: 'Sistemas de Informação', semestre: '7º' },
      { id: '4', nome: 'Ana Oliveira', email: 'ana.oliveira@email.com', matricula: '2024004', curso: 'Engenharia de Software', semestre: '1º' },
      { id: '5', nome: 'Carlos Ferreira', email: 'carlos.ferreira@email.com', matricula: '2024005', curso: 'Ciência da Computação', semestre: '9º' },
    ];

    this.dataSource = new MatTableDataSource(alunos);
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

  editarAluno(aluno: Aluno): void {
    const dialogRef = this.dialog.open(EditarAlunoDialogComponent, {
      data: { aluno },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      // Atualiza a linha com os dados retornados
      const index = this.dataSource.data.findIndex(a => a.id === result.id);
      if (index > -1) {
        this.dataSource.data[index] = result;
        // Força atualização do datasource
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }
}
