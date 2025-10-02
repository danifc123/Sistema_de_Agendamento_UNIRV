import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

class MockAuthService {
  resetPassword = jasmine.createSpy('resetPassword').and.returnValue(of({ message: 'Senha alterada com sucesso' }));
}

class MockRouter {
  public navigations: any[] = [];
  navigate(commands: any[]) {
    this.navigations.push(commands);
    return Promise.resolve(true);
  }
}

function createActivatedRouteWithToken(token: string) {
  return {
    snapshot: { queryParams: { token } }
  } as unknown as ActivatedRoute;
}

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let auth: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: createActivatedRouteWithToken('token123') }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar token da query string no ngOnInit', () => {
    expect(component.token).toBe('token123');
    expect(component.error).toBe('');
  });

  it('deve validar campos obrigatórios', () => {
    component.novaSenha = '';
    component.confirmarSenha = '';
    component.onSubmit();
    expect(component.error).toBe('Por favor, preencha todos os campos.');
  });

  it('deve validar senhas diferentes', () => {
    component.novaSenha = '123456';
    component.confirmarSenha = 'abcdef';
    component.onSubmit();
    expect(component.error).toBe('As senhas não coincidem.');
  });

  it('deve validar tamanho mínimo da senha', () => {
    component.novaSenha = '12345';
    component.confirmarSenha = '12345';
    component.onSubmit();
    expect(component.error).toBe('A senha deve ter pelo menos 6 caracteres.');
  });

  it('deve chamar resetPassword e navegar em caso de sucesso', fakeAsync(() => {
    component.novaSenha = '123456';
    component.confirmarSenha = '123456';

    component.onSubmit();

    // Avança o tempo de 2s do setTimeout do componente
    tick(2000);

    expect(auth.resetPassword).toHaveBeenCalledWith('token123', '123456');
    expect(component.loading).toBeFalse();
    expect(component.message).toBe('Senha alterada com sucesso');
    expect(router.navigations.at(-1)).toEqual(['/auth']);
  }));

  it('deve tratar erro da API e não navegar', () => {
    auth.resetPassword.and.returnValue(throwError(() => ({ error: { message: 'Token inválido' } })));

    component.novaSenha = '123456';
    component.confirmarSenha = '123456';
    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Token inválido');
    expect(router.navigations.length).toBe(0);
  });

  it('deve setar erro inicial se token ausente', () => {
    const routeNoToken = createActivatedRouteWithToken('');
    const comp2 = new ResetPasswordComponent(routeNoToken, router as any, auth as any);
    comp2.ngOnInit();
    expect(comp2.error).toBe('Token de redefinição inválido.');
  });
});
