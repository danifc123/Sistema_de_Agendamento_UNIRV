import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface InfoAnotacaoData {
  alunoNome: string;
  data: string;
  diaSemana: string;
  descricao: string;
}

@Component({
  selector: 'app-info-anotacao-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './info-anotacao-dialog.component.html',
  styleUrl: './info-anotacao-dialog.component.scss'
})
export class InfoAnotacaoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InfoAnotacaoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InfoAnotacaoData
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }
}

