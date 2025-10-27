import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

class MockRouter {
  public navigateCalls: any[] = [];
  navigate(commands: any[], extras?: any) {
    this.navigateCalls.push({ commands, extras });
    return Promise.resolve(true);
  }
}

class MockAuthService {
  private authenticated = false;
  private tipo: string | null = null;

  isAuthenticated() { return this.authenticated; }
  getCurrentUser() { return this.authenticated && this.tipo ? { Id: 1, Nome: 'User', Email: 'u@u.com', Tipo: this.tipo } : null; }
  hasRole(role: string) { return this.getCurrentUser()?.Tipo === role; }

  setAuth(value: boolean, tipo?: string) {
    this.authenticated = value;
    this.tipo = tipo ?? null;
  }
}

function createRoute(data: any = {}): ActivatedRouteSnapshot {
  return { data } as ActivatedRouteSnapshot;
}

function createState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let router: MockRouter;
  let authService: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService }
      ]
    });

    guard = TestBed.inject(RoleGuard);
    router = TestBed.inject(Router) as unknown as MockRouter;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  it('deve negar acesso e redirecionar para /auth quando não autenticado', () => {
    authService.setAuth(false);

    const result = guard.canActivate(createRoute({ roles: ['Admin'] }), createState('/relatorio'));
    expect(result).toBeFalse();
    expect(router.navigateCalls[0].commands).toEqual(['/auth']);
  });

  it('deve permitir acesso quando nenhuma role é necessária', () => {
    authService.setAuth(true, 'Aluno');

    const result = guard.canActivate(createRoute({}), createState('/home'));
    expect(result).toBeTrue();
  });

  it('deve permitir acesso quando usuário possui a role necessária', () => {
    authService.setAuth(true, 'Admin');

    const result = guard.canActivate(createRoute({ roles: ['Admin'] }), createState('/relatorio'));
    expect(result).toBeTrue();
  });

  it('deve permitir acesso quando usuário possui uma das roles necessárias', () => {
    authService.setAuth(true, 'Psicologo');

    const result = guard.canActivate(createRoute({ roles: ['Admin', 'Psicologo'] }), createState('/anotacoes'));
    expect(result).toBeTrue();
  });

  it('deve negar acesso e redirecionar quando não possui a role', () => {
    authService.setAuth(true, 'Aluno');

    const result = guard.canActivate(createRoute({ roles: ['Admin'] }), createState('/relatorio'));
    expect(result).toBeFalse();
    expect(router.navigateCalls[0].commands).toEqual(['/unauthorized']);
  });
});
