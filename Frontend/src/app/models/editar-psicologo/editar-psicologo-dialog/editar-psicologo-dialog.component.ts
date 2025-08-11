import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InputComponent } from '../../../components/input/input.component';
import { ButtonComponent } from '../../../components/button/button.component';

export interface EditarPsicologoDialogData {
  psicologo: {
    id: string;
    nome: string;
    email: string;
    crp: string;
    especialidade: string;
  };
}

@Component({
  selector: 'app-editar-psicologo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, InputComponent, ButtonComponent],
  templateUrl: './editar-psicologo-dialog.component.html',
  styleUrl: './editar-psicologo-dialog.component.scss'
})
export class EditarPsicologoDialogComponent {
  nome: string;
  email: string;
  crp: string;
  especialidade: string;

  constructor(
    public dialogRef: MatDialogRef<EditarPsicologoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditarPsicologoDialogData,
  ) {
    const { psicologo } = data;
    this.nome = psicologo.nome;
    this.email = psicologo.email;
    this.crp = psicologo.crp;
    this.especialidade = psicologo.especialidade;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    this.dialogRef.close({
      ...this.data.psicologo,
      nome: this.nome,
      email: this.email,
      crp: this.crp,
      especialidade: this.especialidade,
    });
  }
}
