import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarioComponent } from "../../components/calendario/calendario.component";
import { InputComponent } from "../../components/input/input.component";
import { TabelaAgendamentoComponent } from "../../components/tabela-agendamento/tabela-agendamento.component";
import { ButtonComponent } from "../../components/button/button.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, CalendarioComponent, InputComponent, TabelaAgendamentoComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Dados do agendamento
  matricula: string = '';
  nomeAluno: string = '';
  nomePsicologo: string = '';
  data: string = '';
  horario: string = '';
  dataSelecionada: string = '';

  agendarConsulta(): void {
    // Validar se todos os campos estão preenchidos
    if (!this.matricula || !this.nomeAluno || !this.nomePsicologo || !this.horario) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione uma data no calendário.');
      return;
    }

    // Criar objeto com os dados do agendamento
    const agendamentoData = {
      matricula: this.matricula,
      nomeAluno: this.nomeAluno,
      nomePsicologo: this.nomePsicologo,
      data: this.data, // Será obtida do calendário
      horario: this.horario
    };

    // Aqui você implementará a lógica para salvar o agendamento na API
    console.log('Agendando consulta:', agendamentoData);

    // TODO: Implementar chamada para API
    // this.agendamentoService.criarAgendamento(agendamentoData).subscribe({
    //   next: (response) => {
    //     console.log('Agendamento criado com sucesso:', response);
    //     this.limparFormulario();
    //     alert('Agendamento realizado com sucesso!');
    //     // Atualizar a tabela de agendamentos
    //   },
    //   error: (error) => {
    //     console.error('Erro ao criar agendamento:', error);
    //     alert('Erro ao criar agendamento. Tente novamente.');
    //   }
    // });

    // Por enquanto, apenas limpar o formulário
    this.limparFormulario();
    alert('Agendamento realizado com sucesso! (Simulação)');
  }

  private limparFormulario(): void {
    this.matricula = '';
    this.nomeAluno = '';
    this.nomePsicologo = '';
    this.data = '';
    this.horario = '';
    this.dataSelecionada = '';
  }

  // Método para receber a data selecionada do calendário
  onDataSelecionada(data: string): void {
    this.dataSelecionada = data;
    this.data = data; // Também armazena para o agendamento
  }


}
