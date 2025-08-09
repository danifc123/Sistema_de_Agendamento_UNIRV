import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

export interface InfoAgendamentoDialogData {
  student: { id: string; name: string };
  psychologist: { id: string; name: string };
  appointment: { date: string; time: string; notes: string };
}

@Component({
  selector: 'app-info-agendamento-dialog',
  standalone: true,
  imports: [MatDialogModule, MatListModule, MatButtonModule],
  templateUrl: './info-agendamento-dialog.component.html',
  styleUrl: './info-agendamento-dialog.component.scss'
})
export class InfoAgendamentoDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InfoAgendamentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: InfoAgendamentoDialogData,
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }
}
