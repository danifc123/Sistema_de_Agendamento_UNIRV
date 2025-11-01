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
  public feriadoNome: string = '';

  private readonly STORAGE_KEY = 'agenda_anotacoes';

  // Removido construtor vazio para evitar método vazio

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

    // Verificar se é feriado
    const dataObj = new Date(evento.dataISO + 'T00:00:00');
    this.feriadoNome = this.getFeriadoNome(dataObj);

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

  private getFeriadoNome(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const key = `${month}-${day}`;

    const feriadosFixos: Record<string, string> = {
      '01-01': 'Ano Novo',
      '04-21': 'Tiradentes',
      '05-01': 'Dia do Trabalho',
      '06-12': 'Dia dos Namorados',
      '09-07': 'Independência do Brasil',
      '10-12': 'Nossa Senhora Aparecida',
      '11-02': 'Finados',
      '11-15': 'Proclamação da República',
      '11-20': 'Consciência Negra',
      '12-25': 'Natal',
    };

    if (feriadosFixos[key]) {
      return feriadosFixos[key];
    }

    const year = date.getFullYear();
    const carnaval = this.getCarnaval(year);
    const pascoa = this.getPascoa(year);
    const corpusChristi = this.getCorpusChristi(year);

    if (this.isSameDate(date, carnaval)) return 'Carnaval';
    if (this.isSameDate(date, pascoa)) return 'Páscoa';
    if (this.isSameDate(date, corpusChristi)) return 'Corpus Christi';

    return '';
  }

  private getCarnaval(year: number): Date {
    const pascoa = this.getPascoa(year);
    const carnaval = new Date(pascoa);
    carnaval.setDate(pascoa.getDate() - 47);
    return carnaval;
  }

  private getPascoa(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  private getCorpusChristi(year: number): Date {
    const pascoa = this.getPascoa(year);
    const corpus = new Date(pascoa);
    corpus.setDate(pascoa.getDate() + 60);
    return corpus;
  }

  private isSameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }
}
