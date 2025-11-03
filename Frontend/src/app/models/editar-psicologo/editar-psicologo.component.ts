import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonComponent } from "../../components/button/button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditarPsicologoDialogComponent } from './editar-psicologo-dialog/editar-psicologo-dialog.component';
import { PsicologosService, Psicologo } from '../../services/psicologos.service';
import { CommonModule } from '@angular/common';

// Interface para exibição na tabela
export interface PsicologoDisplay {
  Id: number;
  Nome: string;
  Email: string;
  Crp: string;
  Especialidade: string;
}

@Component({
  selector: 'app-editar-psicologo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatDialogModule, ButtonComponent],
  templateUrl: './editar-psicologo.component.html',
  styleUrl: './editar-psicologo.component.scss'
})
export class EditarPsicologoComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['id', 'nome', 'email', 'crp', 'especialidade', 'acoes'];
  dataSource: MatTableDataSource<PsicologoDisplay>;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private psicologosService: PsicologosService
  ) {
    this.dataSource = new MatTableDataSource<PsicologoDisplay>([]);
  }

  ngOnInit(): void {
    this.carregarPsicologos();
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
        case 'crp':
          return item.Crp.toLowerCase();
        case 'especialidade':
          return item.Especialidade.toLowerCase();
        default:
          return item[property as keyof PsicologoDisplay];
      }
    };

    // Configurar filtro customizado para buscar em múltiplos campos
    this.dataSource.filterPredicate = (data: PsicologoDisplay, filter: string) => {
      const searchStr = filter.toLowerCase();

      // Buscar em todos os campos relevantes
      return data.Id.toString().includes(searchStr) ||
             data.Nome.toLowerCase().includes(searchStr) ||
             data.Email.toLowerCase().includes(searchStr) ||
             data.Crp.toLowerCase().includes(searchStr) ||
             data.Especialidade.toLowerCase().includes(searchStr);
    };
  }

  carregarPsicologos(): void {
    this.psicologosService.getPsicologos().subscribe({
      next: (psicologos) => {
        const psicologosDisplay = this.converterParaDisplay(psicologos);
        this.dataSource.data = psicologosDisplay;
      },
      error: (error) => {
        console.error('Erro ao carregar psicólogos:', error);
      }
    });
  }

  private converterParaDisplay(psicologos: Psicologo[]): PsicologoDisplay[] {
    return psicologos.map(psicologo => ({
      Id: psicologo.Id,
      Nome: psicologo.Usuario?.Nome || 'Nome não disponível',
      Email: psicologo.Usuario?.Email || 'Email não disponível',
      Crp: psicologo.Crp,
      Especialidade: psicologo.Especialidade
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

  editarPsicologo(psicologo: PsicologoDisplay): void {
    const dialogRef = this.dialog.open(EditarPsicologoDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      panelClass: 'editar-psicologo-dialog',
      data: {
        psicologo: {
          id: psicologo.Id.toString(),
          nome: psicologo.Nome,
          email: psicologo.Email,
          crp: psicologo.Crp,
          especialidade: psicologo.Especialidade
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recarregar dados da tabela para garantir sincronização com o banco
        this.carregarPsicologos();
      }
    });
  }

  excluirPsicologo(psicologo: PsicologoDisplay): void {
    const confirmacao = confirm(`Tem certeza que deseja excluir o psicólogo "${psicologo.Nome}"?\n\n⚠️ ATENÇÃO: Esta ação irá excluir:\n• Todos os agendamentos do psicólogo\n• Todas as anotações do psicólogo\n• Todas as disponibilidades do psicólogo\n• O cadastro completo do psicólogo\n\nEsta ação não pode ser desfeita.`);

    if (confirmacao) {
      this.psicologosService.deletePsicologo(psicologo.Id).subscribe({
        next: () => {
          alert('Psicólogo excluído com sucesso!\n\nTodos os dados relacionados foram removidos.');
          this.carregarPsicologos(); // Recarregar a tabela
        },
        error: (error) => {
          console.error('Erro ao excluir psicólogo:', error);
          alert('Erro ao excluir psicólogo. Verifique se não há dados dependentes ou tente novamente.');
        }
      });
    }
  }
}
