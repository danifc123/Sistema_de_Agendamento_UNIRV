import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ButtonComponent } from "../button/button.component";
import { MatDialog } from '@angular/material/dialog';
import { EditAlunoDialogComponent } from "../dialogs/edit-aluno-dialog/edit-aluno-dialog.component";
import { InfoAgendamentoDialogComponent } from "../dialogs/info-agendamento-dialog/info-agendamento-dialog.component";

export interface Student {
  id: string;
  name: string;
}

/** Constants used to fill up our data base. */
const NAMES: string[] = [
  'Maia',
  'Asher',
  'Olivia',
  'Atticus',
  'Amelia',
  'Jack',
  'Charlotte',
  'Theodore',
  'Isla',
  'Oliver',
  'Isabella',
  'Jasper',
  'Cora',
  'Levi',
  'Violet',
  'Arthur',
  'Mia',
  'Thomas',
  'Elizabeth',
];

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-tabela-agendamento',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, ButtonComponent],
  templateUrl: './tabela-agendamento.component.html',
  styleUrl: './tabela-agendamento.component.scss'
})
export class TabelaAgendamentoComponent implements AfterViewInit{
  displayedColumns: string[] = ['id', 'name', 'edit', 'info'];
  dataSource: MatTableDataSource<Student>;

@ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
@ViewChild(MatSort, { static: false }) sort!: MatSort;
   constructor(private dialog: MatDialog) {
    // Create 100 students
    const students = Array.from({length: 100}, (_, k) => createNewStudent(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(students);
    // Custom sort para garantir ordenação correta
    this.dataSource.sortingDataAccessor = (item: Student, property: string): string | number => {
      switch (property) {
        case 'id':
          return Number(item.id);
        case 'name':
          return item.name;
        default:
          return '';
      }
    };

    // Ordenação com locale PT-BR para nomes com acentos
    const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
    this.dataSource.sortData = (data, sort) => {
      if (!sort.active || sort.direction === '') return data;
      const direction = sort.direction === 'asc' ? 1 : -1;
      return data.slice().sort((a, b) => {
        if (sort.active === 'name') {
          return collator.compare(a.name, b.name) * direction;
        }
        if (sort.active === 'id') {
          return (Number(a.id) - Number(b.id)) * direction;
        }
        return 0;
      });
    };
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

  onEdit(row: Student): void {
    const dialogRef = this.dialog.open(EditAlunoDialogComponent, {
      width: '560px',
      data: {
        student: { id: row.id, name: row.name },
        psychologist: { id: 'P-' + row.id, name: 'Dr(a). ' + row.name.split(' ')[0] },
        appointment: { date: '12/08/2025', time: '14:00', notes: '' }
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const updated = this.dataSource.data.map((s) =>
        s.id === row.id ? { ...s, name: result.student?.name ?? s.name } : s
      );
      this.dataSource.data = updated;
    });
  }

  onInfo(row: Student): void {
    this.dialog.open(InfoAgendamentoDialogComponent, {
      width: '520px',
      data: {
        student: { id: row.id, name: row.name },
        psychologist: { id: 'P-' + row.id, name: 'Dr(a). ' + row.name.split(' ')[0] },
        appointment: { date: '12/08/2025', time: '14:00', notes: 'Retorno de avaliação.' }
      }
    });
  }
}
/** Builds and returns a new Student. */
function createNewStudent(id: number): Student {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
    ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
    '.';

  return {
    id: id.toString(),
    name: name,
  };
}
