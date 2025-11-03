import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Disponibilidade } from '../../../services/disponibilidades.service';

export interface EditBloqueioDialogData {
  bloqueio: Disponibilidade;
}

@Component({
  selector: 'app-edit-bloqueio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './edit-bloqueio-dialog.component.html',
  styleUrl: './edit-bloqueio-dialog.component.scss'
})
export class EditBloqueioDialogComponent {
  data: string = '';
  horaInicio: string = '';
  horaFim: string = '';
  dataSelecionada: Date | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditBloqueioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditBloqueioDialogData
  ) {
    // Converter data de YYYY-MM-DD para Date
    const partes = dialogData.bloqueio.Data.split('-');
    if (partes.length === 3) {
      this.dataSelecionada = new Date(+partes[0], +partes[1] - 1, +partes[2]);
      this.data = `${partes[2]}/${partes[1]}/${partes[0]}`; // DD/MM/YYYY
    } else {
      this.data = dialogData.bloqueio.Data;
    }

    this.horaInicio = dialogData.bloqueio.HoraInicio;
    this.horaFim = dialogData.bloqueio.HoraFim;
  }

  onDateChange(event: any): void {
    if (event.value) {
      const date = event.value as Date;
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const ano = date.getFullYear();
      this.data = `${dia}/${mes}/${ano}`;
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    if (!this.data.trim() || !this.horaInicio.trim() || !this.horaFim.trim()) {
      alert('Todos os campos são obrigatórios.');
      return;
    }

    // Validar formato de data DD/MM/YYYY
    const partesData = this.data.trim().split('/');
    if (partesData.length !== 3) {
      alert('Formato de data inválido. Use DD/MM/YYYY');
      return;
    }

    const dia = partesData[0].padStart(2, '0');
    const mes = partesData[1].padStart(2, '0');
    const ano = partesData[2];
    const dataFormatada = `${ano}-${mes}-${dia}`;

    // Validar formato de hora
    const regexHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regexHora.test(this.horaInicio.trim()) || !regexHora.test(this.horaFim.trim())) {
      alert('Formato de hora inválido. Use HH:mm (exemplo: 08:00)');
      return;
    }

    this.dialogRef.close({
      Data: dataFormatada,
      HoraInicio: this.horaInicio.trim(),
      HoraFim: this.horaFim.trim()
    });
  }
}

