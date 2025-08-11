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

@Injectable({
  providedIn: 'root'
})
export class AlunosService {
  private baseUrl = 'http://localhost:5160/api';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  getAlunos(): Observable<Aluno[]> {
    return this.apiService.get<Aluno>('alunos');
  }

  getAluno(id: number): Observable<Aluno> {
    return this.apiService.getById<Aluno>('alunos', id);
  }

  getAlunoPorMatricula(matricula: string): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.baseUrl}/alunos/matricula/${matricula}`);
  }

  createAluno(aluno: Omit<Aluno, 'Id'>): Observable<Aluno> {
    return this.apiService.post<Aluno>('alunos', aluno);
  }

  createAlunoComId(id: number, aluno: Omit<Aluno, 'Id'>): Observable<Aluno> {
    return this.http.post<Aluno>(`${this.baseUrl}/alunos`, { Id: id, ...aluno });
  }

  updateAluno(id: number, aluno: Partial<Aluno>): Observable<Aluno> {
    return this.apiService.put<Aluno>('alunos', id, aluno);
  }

  deleteAluno(id: number): Observable<Aluno> {
    return this.apiService.delete<Aluno>('alunos', id);
  }
}
