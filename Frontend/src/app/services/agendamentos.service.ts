import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

export interface Usuario {
  Id: number;
  Nome: string;
  Email: string;
  Senha: string;
  Tipo: string;
}

export interface Aluno {
  Id: number;
  Matricula: string;
  Curso: string;
  Semestre: number;
  Usuario?: Usuario;
}

export interface Psicologo {
  Id: number;
  Crp: string;
  Especialidade: string;
  Usuario?: Usuario;
}

export interface Agendamento {
  Id: number;
  AlunoId: number;
  PsicologoId: number;
  Data: string; // DateOnly como string
  Horario: string; // TimeOnly como string
  Status: 'Pendente' | 'Confirmado' | 'Cancelado';
  DataCriacao: string;
  DataConfirmacao?: string;
  DataCancelamento?: string;
  Aluno?: Aluno;
  Psicologo?: Psicologo;
}

@Injectable({
  providedIn: 'root'
})
export class AgendamentosService {
  private baseUrl = 'http://localhost:5160/api';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  getAgendamentos(): Observable<Agendamento[]> {
    return this.apiService.get<Agendamento>('agendamentos');
  }

  getAgendamento(id: number): Observable<Agendamento> {
    return this.apiService.getById<Agendamento>('agendamentos', id);
  }

  getAgendamentosPorAluno(alunoId: number): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos/aluno/${alunoId}`);
  }

  getAgendamentosPorPsicologo(psicologoId: number): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos/psicologo/${psicologoId}`);
  }

  createAgendamento(agendamento: Omit<Agendamento, 'Id' | 'DataCriacao'>): Observable<Agendamento> {
    return this.apiService.post<Agendamento>('agendamentos', agendamento);
  }

  updateAgendamento(id: number, agendamento: Partial<Agendamento>): Observable<Agendamento> {
    return this.apiService.put<Agendamento>('agendamentos', id, agendamento);
  }

  updateStatus(id: number, status: Agendamento['Status']): Observable<Agendamento> {
    return this.apiService.patch<Agendamento>('agendamentos', id, { Status: status });
  }

  deleteAgendamento(id: number): Observable<Agendamento> {
    return this.apiService.delete<Agendamento>('agendamentos', id);
  }
}
