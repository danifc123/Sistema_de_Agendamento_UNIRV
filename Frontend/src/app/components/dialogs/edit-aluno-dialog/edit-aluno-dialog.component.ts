import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InputComponent } from '../../input/input.component';

export interface EditAlunoDialogData {
  student: { id: string; name: string };
  psychologist: { id: string; name: string };
  appointment: { date: string; time: string; notes: string };
}

@Component({
  selector: 'app-edit-aluno-dialog',
  standalone: true,
  imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, InputComponent],
  templateUrl: './edit-aluno-dialog.component.html',
  styleUrl: './edit-aluno-dialog.component.scss'
})
export class EditAlunoDialogComponent {
  alunoNome: string;
  psicologoNome: string;
  data: string;
  hora: string;
  observacoes: string;

  constructor(
    public dialogRef: MatDialogRef<EditAlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditAlunoDialogData,
  ) {
    this.alunoNome = dialogData.student.name;
    this.psicologoNome = dialogData.psychologist.name;
    this.data = dialogData.appointment.date;
    this.hora = dialogData.appointment.time;
    this.observacoes = dialogData.appointment.notes;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    this.dialogRef.close({
      student: { ...this.dialogData.student, name: this.alunoNome },
      psychologist: { ...this.dialogData.psychologist, name: this.psicologoNome },
      appointment: { date: this.data, time: this.hora, notes: this.observacoes },
    });
  }
}
