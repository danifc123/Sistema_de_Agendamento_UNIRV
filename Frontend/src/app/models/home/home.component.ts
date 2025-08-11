import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioComponent } from "../../components/calendario/calendario.component";
import { TabelaAgendamentoComponent } from "../../components/tabela-agendamento/tabela-agendamento.component";
import { ButtonComponent } from "../../components/button/button.component";
import { SelectComponent, SelectOption } from "../../components/select/select.component";
import { SelectHorarioComponent } from "../../components/select-horario/select-horario.component";
import { AgendamentosService } from '../../services/agendamentos.service';
import { AlunosService } from '../../services/alunos.service';
import { PsicologosService } from '../../services/psicologos.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule, CalendarioComponent, TabelaAgendamentoComponent, ButtonComponent, SelectComponent, SelectHorarioComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild(TabelaAgendamentoComponent) tabelaAgendamento!: TabelaAgendamentoComponent;

  // Dados do agendamento
  alunoSelecionado: string = '';
  psicologoSelecionado: string = '';
  data: string = '';
  horario: string = '';
  dataSelecionada: string = '';
  dataExibicao: string = '';
  status: string = 'Pendente';

  // Opções para os selects
  opcoesAlunos: SelectOption[] = [];
  opcoesPsicologos: SelectOption[] = [];
  opcoesStatus: SelectOption[] = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Confirmado', label: 'Confirmado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  // Listas para carregar dados
  alunos: any[] = [];
  psicologos: any[] = [];
  agendamentos: any[] = [];

  constructor(
    private agendamentosService: AgendamentosService,
    private alunosService: AlunosService,
    private psicologosService: PsicologosService
  ) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    // Carregar alunos
    this.alunosService.getAlunos().subscribe({
      next: (alunos) => {
        this.alunos = alunos;
        this.opcoesAlunos = alunos.map(aluno => ({
          value: aluno.Id.toString(),
          label: aluno.Usuario?.Nome || 'Nome não disponível'
        }));
        console.log('Alunos carregados:', alunos);
      },
      error: (error) => {
        console.error('Erro ao carregar alunos:', error);
      }
    });

    // Carregar psicólogos
    this.psicologosService.getPsicologos().subscribe({
      next: (psicologos) => {
        this.psicologos = psicologos;
        this.opcoesPsicologos = psicologos.map(psicologo => ({
          value: psicologo.Id.toString(),
          label: psicologo.Usuario?.Nome || 'Nome não disponível'
        }));
        console.log('Psicólogos carregados:', psicologos);
      },
      error: (error) => {
        console.error('Erro ao carregar psicólogos:', error);
      }
    });

    // Carregar agendamentos
    this.agendamentosService.getAgendamentos().subscribe({
      next: (agendamentos) => {
        this.agendamentos = agendamentos;
        console.log('Agendamentos carregados:', agendamentos);
      },
      error: (error) => {
        console.error('Erro ao carregar agendamentos:', error);
      }
    });
  }

  agendarConsulta(): void {
    // Validar se todos os campos estão preenchidos
    if (!this.alunoSelecionado || !this.psicologoSelecionado || !this.horario || !this.data) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione uma data no calendário.');
      return;
    }

    // Criar o agendamento
    const agendamentoData = {
      AlunoId: parseInt(this.alunoSelecionado),
      PsicologoId: parseInt(this.psicologoSelecionado),
      Data: this.data, // Já está no formato ISO (YYYY-MM-DD)
      Horario: this.horario,
      Status: this.status as 'Pendente' | 'Confirmado' | 'Cancelado'
    };

    console.log('Dados do agendamento:', agendamentoData);

    this.agendamentosService.createAgendamento(agendamentoData).subscribe({
      next: (response) => {
        console.log('Agendamento criado com sucesso:', response);
        this.limparFormulario();
        alert('Agendamento realizado com sucesso!');
        // Recarregar dados da tabela
        if (this.tabelaAgendamento) {
          this.tabelaAgendamento.recarregarDados();
        }
      },
      error: (error) => {
        console.error('Erro ao criar agendamento:', error);
        console.error('Detalhes do erro:', error.error);
        alert('Erro ao criar agendamento. Tente novamente.');
      }
    });
  }

  private limparFormulario(): void {
    this.alunoSelecionado = '';
    this.psicologoSelecionado = '';
    this.data = '';
    this.horario = '';
    this.dataSelecionada = '';
    this.dataExibicao = '';
    this.status = 'Pendente';
  }

  // Método para receber a data selecionada do calendário
  onDataSelecionada(dadosData: {dataISO: string, dataExibicao: string}): void {
    this.data = dadosData.dataISO; // Para a API
    this.dataExibicao = dadosData.dataExibicao; // Para exibição
    this.dataSelecionada = dadosData.dataExibicao; // Para mostrar no template
  }
}
