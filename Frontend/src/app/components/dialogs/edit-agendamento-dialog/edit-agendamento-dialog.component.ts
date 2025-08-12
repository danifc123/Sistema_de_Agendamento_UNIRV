import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { InputComponent } from '../../input/input.component';
import { ButtonComponent } from '../../button/button.component';
import { SelectComponent, SelectOption } from '../../select/select.component';
import { SelectHorarioComponent } from '../../select-horario/select-horario.component';
import { AlunosService } from '../../../services/alunos.service';
import { PsicologosService } from '../../../services/psicologos.service';

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
  imports: [CommonModule, FormsModule, MatDialogModule, InputComponent, ButtonComponent, SelectComponent, SelectHorarioComponent],
  templateUrl: './edit-agendamento-dialog.component.html',
  styleUrl: './edit-agendamento-dialog.component.scss'
})
export class EditAgendamentoDialogComponent implements OnInit {
  alunoSelecionado: string = '';
  psicologoSelecionado: string = '';
  dataAgendamento: string = '';
  horario: string = '';

  opcoesAlunos: SelectOption[] = [];
  opcoesPsicologos: SelectOption[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditAgendamentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditAgendamentoDialogData,
    private alunosService: AlunosService,
    private psicologosService: PsicologosService
  ) {
    // Inicializar com os valores atuais do agendamento
    this.alunoSelecionado = data.agendamento.alunoId.toString();
    this.psicologoSelecionado = data.agendamento.psicologoId.toString();

    // Converter a data para formato ISO se necessário (para o input type="date")
    console.log('Data recebida no dialog:', data.agendamento.data);

    let dataParaInput = data.agendamento.data;
    if (data.agendamento.data && data.agendamento.data.includes('/')) {
      // Se a data está no formato DD/MM/AAAA, converter para YYYY-MM-DD
      const partes = data.agendamento.data.split('/');
      console.log('Partes da data:', partes);
      if (partes.length === 3) {
        dataParaInput = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    }
    console.log('Data convertida para input:', dataParaInput);
    this.dataAgendamento = dataParaInput;

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
    console.log('Data original no dialog:', this.dataAgendamento);

    // A data já deve estar no formato YYYY-MM-DD do input type="date"
    let dataFormatada = this.dataAgendamento;

    // Se por algum motivo não estiver no formato correto, tentar converter
    if (this.dataAgendamento && this.dataAgendamento.includes('/')) {
      const partes = this.dataAgendamento.split('/');
      console.log('Partes da data:', partes);
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
      }
    }

    console.log('Data formatada:', dataFormatada);

    this.dialogRef.close({
      id: this.data.agendamento.id,
      alunoId: parseInt(this.alunoSelecionado),
      psicologoId: parseInt(this.psicologoSelecionado),
      data: dataFormatada,
      horario: this.horario,
      status: this.data.agendamento.status
    });
  }
}
