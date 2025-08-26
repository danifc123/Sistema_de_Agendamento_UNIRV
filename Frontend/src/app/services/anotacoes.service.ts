import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Anotacao {
  Id?: number;
  AlunoId: number;
  PsicologoId: number;
  Descricao: string;
  Data: string; // formato YYYY-MM-DD
  AgendamentoId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnotacoesService {
  constructor(private apiService: ApiService) { }

  // Buscar anotações por aluno
  getAnotacoesPorAluno(alunoId: number): Observable<Anotacao[]> {
    return this.apiService.get<Anotacao>(`anotacoes/aluno/${alunoId}`);
  }

  // Buscar anotações por psicólogo
  getAnotacoesPorPsicologo(psicologoId: number): Observable<Anotacao[]> {
    return this.apiService.get<Anotacao>(`anotacoes/psicologo/${psicologoId}`);
  }

  // Buscar anotação por data e usuário
  getAnotacaoPorData(data: string, alunoId: number, psicologoId: number): Observable<Anotacao[]> {
    return this.apiService.get<Anotacao>(`anotacoes/data/${data}/${alunoId}/${psicologoId}`);
  }

  // Criar nova anotação
  criarAnotacao(anotacao: Anotacao): Observable<Anotacao> {
    return this.apiService.post<Anotacao>('anotacoes', anotacao);
  }

  // Atualizar anotação existente
  atualizarAnotacao(id: number, anotacao: Anotacao): Observable<Anotacao> {
    return this.apiService.put<Anotacao>('anotacoes', id, anotacao);
  }

  // Deletar anotação
  deletarAnotacao(id: number): Observable<any> {
    return this.apiService.delete<any>('anotacoes', id);
  }

  // Buscar anotação específica
  getAnotacao(id: number): Observable<Anotacao> {
    return this.apiService.getById<Anotacao>('anotacoes', id);
  }
}
