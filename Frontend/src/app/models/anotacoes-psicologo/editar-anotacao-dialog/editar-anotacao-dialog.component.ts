import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../components/input/input.component';

export interface EditarAnotacaoData {
  alunoNome: string;
  data: string;
  descricao: string;
}

@Component({
  selector: 'app-editar-anotacao-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, InputComponent],
  templateUrl: './editar-anotacao-dialog.component.html',
  styleUrl: './editar-anotacao-dialog.component.scss'
})
export class EditarAnotacaoDialogComponent {
  descricaoEditada: string;

  constructor(
    public dialogRef: MatDialogRef<EditarAnotacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditarAnotacaoData
  ) {
    this.descricaoEditada = data.descricao;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    if (!this.descricaoEditada?.trim()) {
      alert('A descrição não pode estar vazia.');
      return;
    }

    this.dialogRef.close(this.descricaoEditada.trim());
  }
}

