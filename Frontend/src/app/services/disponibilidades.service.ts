import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CriarBloqueioRequest {
  PsicologoId: number;
  Data: string; // yyyy-MM-dd
  HoraInicio: string; // HH:mm
  HoraFim: string; // HH:mm
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadesService {
  private baseUrl = environment.apiUrl + '/disponibilidades';

  constructor(private http: HttpClient) { }

  criarBloqueio(payload: CriarBloqueioRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, payload);
  }

  listarPorPsicologo(psicologoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/psicologo/${psicologoId}`);
  }
}
