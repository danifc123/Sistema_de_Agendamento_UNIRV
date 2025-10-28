import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CriarBloqueioRequest {
  PsicologoId: number;
  Data: string; // yyyy-MM-dd
  HoraInicio: string; // HH:mm
  HoraFim: string; // HH:mm
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadesService {
  private baseUrl = 'https://backend-production-612b.up.railway.app/api/disponibilidades';

  constructor(private http: HttpClient) {}

  criarBloqueio(payload: CriarBloqueioRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, payload);
  }

  listarPorPsicologo(psicologoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/psicologo/${psicologoId}`);
  }
}
