import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginRequest, RegisterRequest, AuthResponse, UserInfo } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://backend-production-612b.up.railway.app/api/auth';

  // Mock data
  const mockUser: UserInfo = {
    Id: 1,
    Nome: 'João Silva',
    Email: 'joao@test.com',
    Tipo: 'Admin',
    Matricula: '123456'
  };

  const mockAuthResponse: AuthResponse = {
    Success: true,
    Token: 'fake-jwt-token',
    RefreshToken: 'fake-refresh-token',
    ExpiresAt: '2024-12-31T23:59:59Z',
    User: mockUser,
    Message: 'Login realizado com sucesso'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Limpar localStorage antes de cada teste
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Login', () => {
    it('should login successfully', () => {
      const loginData: LoginRequest = {
        email: 'joao@test.com',
        senha: '123456'
      };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        expect(localStorage.getItem('refreshToken')).toBe('fake-refresh-token');
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
        expect(service.getCurrentUser()).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockAuthResponse);
    });

    it('should handle login failure', () => {
      const loginData: LoginRequest = {
        email: 'wrong@test.com',
        senha: 'wrongpass'
      };

      const errorResponse: AuthResponse = {
        Success: false,
        Token: '',
        RefreshToken: '',
        ExpiresAt: '',
        User: {} as UserInfo,
        Message: 'Credenciais inválidas'
      };

      service.login(loginData).subscribe(response => {
        expect(response.Success).toBeFalse();
        expect(response.Message).toBe('Credenciais inválidas');
        expect(localStorage.getItem('token')).toBeNull();
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(errorResponse);
    });
  });

  describe('Register', () => {
    it('should register successfully', () => {
      const registerData: RegisterRequest = {
        nome: 'Maria Silva',
        email: 'maria@test.com',
        senha: '123456',
        confirmarSenha: '123456',
        tipo: 'Aluno'
      };

      service.register(registerData).subscribe(response => {
        expect(response.Success).toBeTrue();
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });
  });

  describe('Password Reset', () => {
    it('should request password reset', () => {
      const email = 'test@example.com';
      const expectedResponse = { message: 'Email de recuperação enviado' };

      service.requestPasswordReset(email).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/forgot-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(expectedResponse);
    });

    it('should reset password', () => {
      const token = 'reset-token';
      const novaSenha = 'newpassword';
      const expectedResponse = { message: 'Senha alterada com sucesso' };

      service.resetPassword(token, novaSenha).subscribe(response => {
        expect(response).toEqual(expectedResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/reset-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        token,
        novaSenha,
        confirmarSenha: novaSenha
      });
      req.flush(expectedResponse);
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should refresh token', () => {
      localStorage.setItem('refreshToken', 'refresh-token');

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token' });
      req.flush(mockAuthResponse);
    });
  });

  describe('Authentication Status', () => {
    it('should return true when authenticated', () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return false when no user', () => {
      localStorage.setItem('token', 'valid-token');
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('User Management', () => {
    it('should get current user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should get current user from server', () => {
      service.getCurrentUserFromServer().subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${baseUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

        it('should load user from localStorage on service creation', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Criar nova instância do service para testar o constructor
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient);

      expect(newService.getCurrentUser()).toEqual(mockUser);
    });

    it('should handle invalid user data in localStorage', () => {
      localStorage.setItem('user', 'invalid-json');

      spyOn(console, 'error');
      const httpClient = TestBed.inject(HttpClient);
      const newService = new AuthService(httpClient);

      expect(console.error).toHaveBeenCalledWith('Erro ao carregar usuário do storage:', jasmine.any(Error));
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Role Management', () => {
    beforeEach(() => {
      service['currentUserSubject'].next(mockUser);
    });

    it('should check if user has specific role', () => {
      expect(service.hasRole('Admin')).toBeTrue();
      expect(service.hasRole('Aluno')).toBeFalse();
    });

    it('should check if user is admin', () => {
      expect(service.isAdmin()).toBeTrue();
    });

    it('should check if user is psicologo', () => {
      const psicologoUser = { ...mockUser, Tipo: 'Psicologo' };
      service['currentUserSubject'].next(psicologoUser);

      expect(service.isPsicologo()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
    });

    it('should check if user is aluno', () => {
      const alunoUser = { ...mockUser, Tipo: 'Aluno' };
      service['currentUserSubject'].next(alunoUser);

      expect(service.isAluno()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
    });

    it('should return false for role checks when no user', () => {
      service['currentUserSubject'].next(null);

      expect(service.hasRole('Admin')).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isPsicologo()).toBeFalse();
      expect(service.isAluno()).toBeFalse();
    });
  });

  describe('Logout', () => {
    it('should logout and clear all data', () => {
      // Setup inicial
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh');
      localStorage.setItem('user', JSON.stringify(mockUser));
      service['currentUserSubject'].next(mockUser);

      // Logout
      service.logout();

      // Verificações
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('Observable currentUser$', () => {
    it('should emit user changes', () => {
      let emittedUser: UserInfo | null = null;

      service.currentUser$.subscribe(user => {
        emittedUser = user;
      });

      service['currentUserSubject'].next(mockUser);
      expect(emittedUser).toEqual(jasmine.objectContaining(mockUser));

      service['currentUserSubject'].next(null);
      expect(emittedUser).toBe(null);
    });
  });
});
