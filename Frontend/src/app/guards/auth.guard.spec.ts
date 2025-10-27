import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
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
  getToken() { return this.authenticated ? 'token' : null; }
  getCurrentUser() { return this.authenticated ? { Id: 1, Nome: 'User', Email: 'u@u.com', Tipo: 'Admin' } : null; }
  isAuthenticated() { return this.authenticated; }
  setAuthenticated(value: boolean) { this.authenticated = value; }
}

function createState(url: string): RouterStateSnapshot {
  return { url } as RouterStateSnapshot;
}

function createRoute(): ActivatedRouteSnapshot {
  return {} as ActivatedRouteSnapshot;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: MockRouter;
  let authService: MockAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router) as unknown as MockRouter;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
  });

  it('deve permitir acesso quando autenticado', () => {
    authService.setAuthenticated(true);

    const result = guard.canActivate(createRoute(), createState('/dashboard'));
    expect(result).toBeTrue();
    expect(router.navigateCalls.length).toBe(0);
  });

  it('deve negar acesso e redirecionar para /auth quando não autenticado', () => {
    authService.setAuthenticated(false);

    const result = guard.canActivate(createRoute(), createState('/dashboard'));
    expect(result).toBeFalse();

    expect(router.navigateCalls.length).toBe(1);
    const call = router.navigateCalls[0];
    expect(call.commands).toEqual(['/auth']);
    expect(call.extras?.queryParams?.returnUrl).toBe('/dashboard');
  });
});
