import { Component, OnInit } from '@angular/core';
import { CalendarioComponent } from "../../components/calendario/calendario.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AnotacaoLocal {
  id: string;
  data: string;
  texto: string;
  dataCriacao: string;
  dataModificacao: string;
}

@Component({
  selector: 'app-agendamentos',
  imports: [CalendarioComponent, CommonModule, FormsModule],
  templateUrl: './agendamentos.component.html',
  styleUrl: './agendamentos.component.scss'
})
export class AgendamentosComponent implements OnInit {
  public anotacoes: AnotacaoLocal[] = [];
  public anotacaoAtual: AnotacaoLocal | null = null;
  public dataSelecionada: string = '';
  public textoAnotacao: string = '';
  public carregando: boolean = false;

  private readonly STORAGE_KEY = 'agenda_anotacoes';

  constructor() {}

  ngOnInit(): void {
    this.carregarAnotacoes();
  }

  private carregarAnotacoes(): void {
    try {
      const anotacoesSalvas = localStorage.getItem(this.STORAGE_KEY);
      this.anotacoes = anotacoesSalvas ? JSON.parse(anotacoesSalvas) : [];
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      this.anotacoes = [];
    }
  }

  private salvarAnotacoesNoStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.anotacoes));
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
    }
  }

  public onDataSelecionada(evento: {dataISO: string, dataExibicao: string}): void {
    console.log('Evento recebido:', evento);
    this.dataSelecionada = evento.dataISO;
    this.buscarAnotacaoPorData(evento.dataISO);
  }

  private buscarAnotacaoPorData(data: string): void {
    console.log('Buscando anotação para data:', data);
    console.log('Anotações disponíveis:', this.anotacoes);

    const anotacao = this.anotacoes.find(a => a.data === data);

    if (anotacao) {
      console.log('Anotação encontrada:', anotacao);
      this.anotacaoAtual = anotacao;
      this.textoAnotacao = anotacao.texto;
    } else {
      console.log('Nenhuma anotação encontrada para esta data');
      this.anotacaoAtual = null;
      this.textoAnotacao = '';
    }
  }

  public salvarAnotacao(): void {
    if (!this.dataSelecionada || !this.textoAnotacao.trim()) {
      return;
    }

    const agora = new Date().toISOString();

    if (this.anotacaoAtual) {
      // Atualizar anotação existente
      this.anotacaoAtual.texto = this.textoAnotacao.trim();
      this.anotacaoAtual.dataModificacao = agora;
    } else {
      // Criar nova anotação
      const novaAnotacao: AnotacaoLocal = {
        id: this.gerarId(),
        data: this.dataSelecionada,
        texto: this.textoAnotacao.trim(),
        dataCriacao: agora,
        dataModificacao: agora
      };

      this.anotacaoAtual = novaAnotacao;
      this.anotacoes.push(novaAnotacao);
    }

    this.salvarAnotacoesNoStorage();
    alert('Anotação salva com sucesso!');
  }

  public deletarAnotacao(): void {
    if (!this.anotacaoAtual) {
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta anotação?')) {
      return;
    }

    // Remove a anotação da lista
    this.anotacoes = this.anotacoes.filter(a => a.id !== this.anotacaoAtual?.id);

    // Salva no localStorage
    this.salvarAnotacoesNoStorage();

    // Limpa a interface
    this.anotacaoAtual = null;
    this.textoAnotacao = '';

    alert('Anotação excluída com sucesso!');
  }

  private gerarId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  public get datasComAnotacoes(): string[] {
    return this.anotacoes.map(a => a.data);
  }

  public temAnotacao(data: string): boolean {
    return this.anotacoes.some(a => a.data === data);
  }

  public limparTodasAnotacoes(): void {
    if (!confirm('Tem certeza que deseja excluir TODAS as anotações? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.anotacoes = [];
    this.anotacaoAtual = null;
    this.textoAnotacao = '';
    this.dataSelecionada = '';
    this.salvarAnotacoesNoStorage();
    alert('Todas as anotações foram excluídas!');
  }

  public exportarAnotacoes(): void {
    if (this.anotacoes.length === 0) {
      alert('Não há anotações para exportar.');
      return;
    }

    const dados = {
      dataExportacao: new Date().toISOString(),
      totalAnotacoes: this.anotacoes.length,
      anotacoes: this.anotacoes
    };

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anotacoes_agenda_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
