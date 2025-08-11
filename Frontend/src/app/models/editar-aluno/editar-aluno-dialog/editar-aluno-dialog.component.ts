import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InputComponent } from '../../../components/input/input.component';
import { ButtonComponent } from '../../../components/button/button.component';

export interface EditarAlunoDialogData {
  aluno: {
    id: string;
    nome: string;
    email: string;
    matricula: string;
    curso: string;
    semestre: string;
  };
}

@Component({
  selector: 'app-editar-aluno-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, InputComponent, ButtonComponent],
  templateUrl: './editar-aluno-dialog.component.html',
  styleUrl: './editar-aluno-dialog.component.scss'
})
export class EditarAlunoDialogComponent {
  nome: string;
  email: string;
  matricula: string;
  curso: string;
  semestre: string;

  constructor(
    public dialogRef: MatDialogRef<EditarAlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditarAlunoDialogData,
  ) {
    const { aluno } = data;
    this.nome = aluno.nome;
    this.email = aluno.email;
    this.matricula = aluno.matricula;
    this.curso = aluno.curso;
    this.semestre = aluno.semestre;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    this.dialogRef.close({
      ...this.data.aluno,
      nome: this.nome,
      email: this.email,
      matricula: this.matricula,
      curso: this.curso,
      semestre: this.semestre,
    });
  }
}
