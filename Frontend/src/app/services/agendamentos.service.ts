import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

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
  Status: 'Pendente' | 'Confirmado' | 'Cancelado' | 'Apresentado';
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
  private baseUrl = environment.apiUrl;

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

  filtrarAgendamentos(data?: string, psicologoId?: number): Observable<Agendamento[]> {
    const params = new URLSearchParams();
    if (data) params.append('data', data);
    if (psicologoId) params.append('psicologoId', psicologoId.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/agendamentos/filtrar?${queryString}` : `${this.baseUrl}/agendamentos/filtrar`;

    return this.http.get<Agendamento[]>(url);
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

  // Aceitar (confirmar) um agendamento: usa o endpoint PATCH /agendamentos/{id}/status
  aceitarAgendamento(id: number): Observable<void> {
    // Enviar objeto com Status para o backend
    return this.http.patch<void>(`${this.baseUrl}/agendamentos/${id}/status`, { Status: 'Confirmado' });
  }

  deleteAgendamento(id: number): Observable<Agendamento> {
    return this.apiService.delete<Agendamento>('agendamentos', id);
  }

  // Método para verificar se existe conflito de agendamento
  verificarDisponibilidade(alunoId: number, psicologoId: number, data: string, horario: string): Observable<{ disponivel: boolean, message: string, tipo?: string }> {
    const params = new URLSearchParams({
      alunoId: alunoId.toString(),
      psicologoId: psicologoId.toString(),
      data: data,
      horario: horario
    });

    return this.http.get<{ disponivel: boolean, message: string, tipo?: string }>(`${this.baseUrl}/agendamentos/verificar-disponibilidade?${params}`);
  }
}
