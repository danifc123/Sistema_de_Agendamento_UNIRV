import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '../../button/button.component';
import { SelectComponent, SelectOption } from '../../select/select.component';
import { SelectHorarioComponent } from '../../select-horario/select-horario.component';
import { AlunosService } from '../../../services/alunos.service';
import { PsicologosService } from '../../../services/psicologos.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

export interface EditAgendamentoDialogData {
  agendamento: {
    id: number;
    alunoId: number;
    psicologoId: number;
    data: string;
    horario: string;
    status: string;
    aluno?: any; // Dados completos do aluno
    psicologo?: any; // Dados completos do psicólogo
  };
}

@Component({
  selector: 'app-edit-agendamento-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatDatepickerModule, MatInputModule, MatFormFieldModule, MatNativeDateModule, ButtonComponent, SelectComponent, SelectHorarioComponent],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './edit-agendamento-dialog.component.html',
  styleUrl: './edit-agendamento-dialog.component.scss'
})
export class EditAgendamentoDialogComponent implements OnInit {
  alunoSelecionado: string = '';
  psicologoSelecionado: string = '';
  dataAgendamento: string = '';
  dataControl = new FormControl(new Date());
  horario: string = '';
  statusSelecionado: string = '';

  opcoesAlunos: SelectOption[] = [];
  opcoesPsicologos: SelectOption[] = [];
  opcoesStatus: SelectOption[] = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Confirmado', label: 'Confirmado' },
    { value: 'Cancelado', label: 'Cancelado' }
    // Apresentado será automático, não aparece aqui
  ];

  constructor(
    public dialogRef: MatDialogRef<EditAgendamentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditAgendamentoDialogData,
    private alunosService: AlunosService,
    private psicologosService: PsicologosService
  ) {
    // Inicializar com os valores atuais do agendamento
    this.alunoSelecionado = data.agendamento.alunoId.toString();
    this.psicologoSelecionado = data.agendamento.psicologoId.toString();
    this.statusSelecionado = data.agendamento.status;

    // Converter a data para Date object para o datepicker
    console.log('Data recebida no dialog:', data.agendamento.data);

    this.dataAgendamento = data.agendamento.data;

    // Converter para Date object
    let dataObj: Date;
    if (data.agendamento.data && data.agendamento.data.includes('/')) {
      // Se a data está no formato DD/MM/AAAA
      const partes = data.agendamento.data.split('/');
      if (partes.length === 3) {
        dataObj = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
      } else {
        dataObj = new Date(data.agendamento.data);
      }
    } else if (data.agendamento.data && data.agendamento.data.includes('-')) {
      // Se a data está no formato YYYY-MM-DD
      dataObj = new Date(data.agendamento.data + 'T00:00:00');
    } else {
      dataObj = new Date();
    }

    console.log('Data convertida para Date:', dataObj);
    this.dataControl.setValue(dataObj);

    this.horario = data.agendamento.horario;

    // Log dos dados completos recebidos
    console.log('Dados completos do aluno:', data.agendamento.aluno);
    console.log('Dados completos do psicólogo:', data.agendamento.psicologo);
  }

  ngOnInit(): void {
    console.log('ngOnInit - Valores iniciais:');
    console.log('alunoSelecionado:', this.alunoSelecionado);
    console.log('psicologoSelecionado:', this.psicologoSelecionado);
    console.log('dataAgendamento:', this.dataAgendamento);
    console.log('horario:', this.horario);

    this.carregarDados();
  }

  carregarDados(): void {
    // Carregar alunos
    this.alunosService.getAlunos().subscribe({
      next: (alunos) => {
        this.opcoesAlunos = alunos.map(aluno => ({
          value: aluno.Id.toString(),
          label: aluno.Usuario?.Nome || 'Nome não disponível'
        }));

        // Pré-selecionar o aluno atual
        const alunoAtual = alunos.find(a => a.Id === this.data.agendamento.alunoId);
        if (alunoAtual) {
          setTimeout(() => {
            this.alunoSelecionado = alunoAtual.Id.toString();
            console.log('Aluno pré-selecionado:', alunoAtual.Usuario?.Nome);
          }, 0);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar alunos:', error);
      }
    });

    // Carregar psicólogos
    this.psicologosService.getPsicologos().subscribe({
      next: (psicologos) => {
        this.opcoesPsicologos = psicologos.map(psicologo => ({
          value: psicologo.Id.toString(),
          label: psicologo.Usuario?.Nome || 'Nome não disponível'
        }));

        // Pré-selecionar o psicólogo atual
        const psicologoAtual = psicologos.find(p => p.Id === this.data.agendamento.psicologoId);
        if (psicologoAtual) {
          setTimeout(() => {
            this.psicologoSelecionado = psicologoAtual.Id.toString();
            console.log('Psicólogo pré-selecionado:', psicologoAtual.Usuario?.Nome);
          }, 0);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar psicólogos:', error);
      }
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    // Converter Date object para string YYYY-MM-DD
    const dataObj = this.dataControl.value;
    let dataFormatada = '';

    if (dataObj) {
      const ano = dataObj.getFullYear();
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const dia = String(dataObj.getDate()).padStart(2, '0');
      dataFormatada = `${ano}-${mes}-${dia}`;
    }

    console.log('Data selecionada:', dataObj);
    console.log('Data formatada para envio:', dataFormatada);

    this.dialogRef.close({
      id: this.data.agendamento.id,
      alunoId: parseInt(this.alunoSelecionado),
      psicologoId: parseInt(this.psicologoSelecionado),
      data: dataFormatada,
      horario: this.horario,
      status: this.statusSelecionado
    });
  }
}
