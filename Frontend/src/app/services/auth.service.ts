import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  tipo: string;
}

export interface AuthResponse {
  Success: boolean;
  Token: string;
  RefreshToken: string;
  ExpiresAt: string;
  User: UserInfo;
  Message: string;
}

export interface UserInfo {
  Id: number;
  Nome: string;
  Email: string;
  Tipo: string;
  Matricula?: string;
  Crp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5160/api/auth';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('AuthService: Fazendo requisição de login para:', `${this.baseUrl}/login`);
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('AuthService: Resposta completa recebida:', response);
          if (response.Success) {
            console.log('AuthService: Login bem-sucedido, salvando dados');
            this.setAuthData(response);
          } else {
            console.log('AuthService: Login falhou:', response.Message);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap(response => {
          if (response.Success) {
            this.setAuthData(response);
          }
        })
      );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/forgot-password`, { email });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar se o token não expirou
    const user = this.getCurrentUser();
    if (!user) return false;

    return true;
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken });
  }

  getCurrentUserFromServer(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.baseUrl}/me`);
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('token', response.Token);
    localStorage.setItem('refreshToken', response.RefreshToken);
    localStorage.setItem('user', JSON.stringify(response.User));
    this.currentUserSubject.next(response.User);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Erro ao carregar usuário do storage:', error);
        this.logout();
      }
    }
  }

  // Método para verificar se o usuário tem uma role específica
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.Tipo === role;
  }

  // Método para verificar se o usuário é admin
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  // Método para verificar se o usuário é psicólogo
  isPsicologo(): boolean {
    return this.hasRole('Psicologo');
  }

  // Método para verificar se o usuário é aluno
  isAluno(): boolean {
    return this.hasRole('Aluno');
  }
}
