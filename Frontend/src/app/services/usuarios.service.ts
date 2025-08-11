import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Usuario {
  Id: number; // Mudando para maiúsculo para corresponder à API
  Nome: string;
  Email: string;
  Senha: string;
  Tipo: 'Aluno' | 'Psicologo' | 'Admin';
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  constructor(private apiService: ApiService) { }

  getUsuarios(): Observable<Usuario[]> {
    return this.apiService.get<Usuario>('usuarios');
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.apiService.getById<Usuario>('usuarios', id);
  }

  createUsuario(usuario: Omit<Usuario, 'Id'>): Observable<Usuario> {
    return this.apiService.post<Usuario>('usuarios', usuario);
  }

  updateUsuario(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.apiService.put<Usuario>('usuarios', id, usuario);
  }

  deleteUsuario(id: number): Observable<Usuario> {
    return this.apiService.delete<Usuario>('usuarios', id);
  }
}
