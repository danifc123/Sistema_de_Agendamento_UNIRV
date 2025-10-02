import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(of({
    Success: true,
    Token: 't', RefreshToken: 'r', ExpiresAt: '',
    User: { Id: 1, Nome: 'User', Email: 'u@u.com', Tipo: 'Aluno' },
    Message: ''
  } as AuthResponse));
}

class MockRouter {
  public navigations: any[] = [];
  navigate(commands: any[]) { this.navigations.push(commands); return Promise.resolve(true); }
}

function createRouteWithReturnUrl(url?: string) {
  return { snapshot: { queryParams: { returnUrl: url } } } as unknown as ActivatedRoute;
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let auth: MockAuthService;
  let router: Router;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: createRouteWithReturnUrl('/') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate').and.resolveTo(true as any);
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve validar campos obrigatórios', () => {
    component.loginData = { email: '', senha: '' };
    component.onLogin();
    expect(component.errorMessage).toBe('Por favor, preencha todos os campos');
    expect(component.loading).toBeFalse();
  });

  it('deve efetuar login com sucesso e navegar para returnUrl', () => {
    component.loginData = { email: 'u@u.com', senha: '123456' };

    component.onLogin();

    expect(auth.login).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('deve exibir mensagem de credenciais inválidas quando Success=false', () => {
    auth.login.and.returnValue(of({
      Success: false,
      Token: '', RefreshToken: '', ExpiresAt: '',
      User: {} as any,
      Message: 'Credenciais inválidas'
    } as AuthResponse));

    component.loginData = { email: 'u@u.com', senha: 'wrong' };
    component.onLogin();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Credenciais inválidas');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('deve tratar erro 500 e exibir mensagem genérica', () => {
    auth.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.loginData = { email: 'u@u.com', senha: '123456' };
    component.onLogin();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Erro ao fazer login. Tente novamente.');
  });

  it('deve exibir mensagem do backend quando presente no erro', () => {
    auth.login.and.returnValue(throwError(() => ({ error: { Message: 'Conta bloqueada' } })));

    component.loginData = { email: 'u@u.com', senha: '123456' };
    component.onLogin();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Conta bloqueada');
  });
});
