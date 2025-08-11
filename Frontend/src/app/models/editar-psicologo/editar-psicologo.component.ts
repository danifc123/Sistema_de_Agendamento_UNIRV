import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from "../../components/button/button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarPsicologoDialogComponent } from './editar-psicologo-dialog/editar-psicologo-dialog.component';

export interface Psicologo {
  id: string;
  nome: string;
  email: string;
  crp: string;
  especialidade: string;
}

@Component({
  selector: 'app-editar-psicologo',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, ButtonComponent],
  templateUrl: './editar-psicologo.component.html',
  styleUrl: './editar-psicologo.component.scss'
})
export class EditarPsicologoComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'nome', 'email', 'crp', 'especialidade', 'editar'];
  dataSource: MatTableDataSource<Psicologo>;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private dialog: MatDialog) {
    // Dados simulados de psicólogos
    const psicologos = [
      { id: '1', nome: 'Dr. Carlos Silva', email: 'carlos.silva@email.com', crp: '06/123456', especialidade: 'Psicologia Clínica' },
      { id: '2', nome: 'Dra. Ana Santos', email: 'ana.santos@email.com', crp: '06/234567', especialidade: 'Psicologia Escolar' },
      { id: '3', nome: 'Dr. Pedro Costa', email: 'pedro.costa@email.com', crp: '06/345678', especialidade: 'Psicologia Organizacional' },
      { id: '4', nome: 'Dra. Maria Oliveira', email: 'maria.oliveira@email.com', crp: '06/456789', especialidade: 'Psicologia Clínica' },
      { id: '5', nome: 'Dr. João Ferreira', email: 'joao.ferreira@email.com', crp: '06/567890', especialidade: 'Psicologia do Esporte' },
    ];

    this.dataSource = new MatTableDataSource(psicologos);
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

  editarPsicologo(psicologo: Psicologo): void {
    const dialogRef = this.dialog.open(EditarPsicologoDialogComponent, {
      data: { psicologo },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      // Atualiza a linha com os dados retornados
      const index = this.dataSource.data.findIndex(p => p.id === result.id);
      if (index > -1) {
        this.dataSource.data[index] = result;
        // Força atualização do datasource
        this.dataSource.data = [...this.dataSource.data];
      }
    });
  }
}
