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
import { AuthService } from '../../services/auth.service';

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

  // Opções para os selects
  opcoesAlunos: SelectOption[] = [];
  opcoesPsicologos: SelectOption[] = [];

  // Listas para carregar dados
  alunos: any[] = [];
  psicologos: any[] = [];
  agendamentos: any[] = [];

  constructor(
    private agendamentosService: AgendamentosService,
    private alunosService: AlunosService,
    private psicologosService: PsicologosService,
    public authService: AuthService
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

    console.log('Dados antes de criar agendamento:');
    console.log('- Data selecionada:', this.data);
    console.log('- Data de exibição:', this.dataExibicao);
    console.log('- Aluno:', this.alunoSelecionado);
    console.log('- Psicólogo:', this.psicologoSelecionado);
    console.log('- Horário:', this.horario);

    // Criar o agendamento
    const agendamentoData = {
      AlunoId: parseInt(this.alunoSelecionado),
      PsicologoId: parseInt(this.psicologoSelecionado),
      Data: this.data, // Já está no formato ISO (YYYY-MM-DD)
      Horario: this.horario,
      Status: 'Pendente' as 'Pendente' | 'Confirmado' | 'Cancelado' // Status sempre começa como Pendente
    };

    console.log('Dados do agendamento que serão enviados para a API:', agendamentoData);

    // Verificar disponibilidade antes de criar o agendamento
    this.agendamentosService.verificarDisponibilidade(
      agendamentoData.AlunoId,
      agendamentoData.PsicologoId,
      agendamentoData.Data,
      agendamentoData.Horario
    ).subscribe({
      next: (resultado) => {
        if (!resultado.disponivel) {
          alert(resultado.message);
          return;
        }

        // Se está disponível, criar o agendamento
        this.criarAgendamento(agendamentoData);
      },
      error: (error) => {
        console.error('Erro ao verificar disponibilidade:', error);
        // Em caso de erro na verificação, tentar criar mesmo assim (o backend fará a validação final)
        this.criarAgendamento(agendamentoData);
      }
    });
  }

  private criarAgendamento(agendamentoData: any): void {
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

        // Verificar se é um erro de validação do backend
        if (error.error && error.error.message) {
          alert(`Erro: ${error.error.message}`);
        } else {
          alert('Erro ao criar agendamento. Tente novamente.');
        }
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
  }

  // Método para receber a data selecionada do calendário
  onDataSelecionada(dadosData: {dataISO: string, dataExibicao: string}): void {
    console.log('Data recebida do calendário:', dadosData);
    this.data = dadosData.dataISO; // Para a API
    this.dataExibicao = dadosData.dataExibicao; // Para exibição
    this.dataSelecionada = dadosData.dataExibicao; // Para mostrar no template
    console.log('Data armazenada para API:', this.data);

    // Teste: verificar se a data está correta
    const dataTeste = new Date(dadosData.dataISO);
    console.log('Data convertida de volta para teste:', dataTeste.toLocaleDateString('pt-BR'));
  }

  // Método para verificar disponibilidade quando o usuário seleciona um horário
  verificarDisponibilidadeHorario(): void {
    if (!this.alunoSelecionado || !this.psicologoSelecionado || !this.horario || !this.data) {
      return; // Não verificar se não temos todos os dados
    }

    this.agendamentosService.verificarDisponibilidade(
      parseInt(this.alunoSelecionado),
      parseInt(this.psicologoSelecionado),
      this.data,
      this.horario
    ).subscribe({
      next: (resultado) => {
        if (!resultado.disponivel) {
          // Mostrar aviso visual
          const mensagem = resultado.message;
          console.log('Horário indisponível:', mensagem);

          // Você pode implementar uma notificação visual aqui
          // Por exemplo, mudar a cor do botão ou mostrar um toast
          alert(`⚠️ ${mensagem}\n\nPor favor, escolha outro horário.`);

          // Limpar o horário selecionado
          this.horario = '';
        }
      },
      error: (error) => {
        console.error('Erro ao verificar disponibilidade:', error);
      }
    });
  }
}
