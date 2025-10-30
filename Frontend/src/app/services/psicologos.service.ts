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

export interface Psicologo {
  Id: number;
  Crp: string;
  Especialidade: string;
  Usuario?: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class PsicologosService {
  private baseUrl = environment.apiUrl;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  getPsicologos(): Observable<Psicologo[]> {
    return this.apiService.get<Psicologo>('psicologos');
  }

  getPsicologo(id: number): Observable<Psicologo> {
    return this.apiService.getById<Psicologo>('psicologos', id);
  }

  getPsicologoPorCrp(crp: string): Observable<Psicologo> {
    return this.http.get<Psicologo>(`${this.baseUrl}/psicologos/crp/${crp}`);
  }

  createPsicologo(psicologo: Omit<Psicologo, 'Id'>): Observable<Psicologo> {
    return this.apiService.post<Psicologo>('psicologos', psicologo);
  }

  createPsicologoComId(id: number, psicologo: Omit<Psicologo, 'Id'>): Observable<Psicologo> {
    return this.http.post<Psicologo>(`${this.baseUrl}/psicologos`, { Id: id, ...psicologo });
  }

  updatePsicologo(id: number, psicologo: Partial<Psicologo>): Observable<Psicologo> {
    return this.apiService.put<Psicologo>('psicologos', id, psicologo);
  }

  deletePsicologo(id: number): Observable<Psicologo> {
    return this.apiService.delete<Psicologo>('psicologos', id);
  }
}
