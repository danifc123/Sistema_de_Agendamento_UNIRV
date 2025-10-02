import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

class MockRouter {
  public navigateCalls: any[] = [];
  navigate(commands: any[]) {
    this.navigateCalls.push(commands);
    return Promise.resolve(true);
  }
}

class MockAuthService {
  isAdmin = jasmine.createSpy('isAdmin').and.returnValue(false);
  isPsicologo = jasmine.createSpy('isPsicologo').and.returnValue(false);
  isAluno = jasmine.createSpy('isAluno').and.returnValue(false);
  logout = jasmine.createSpy('logout');
}

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let router: MockRouter;
  let auth: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;
    auth = TestBed.inject(AuthService) as unknown as MockAuthService;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve expor roles via métodos', () => {
    auth.isAdmin.and.returnValue(true);
    auth.isPsicologo.and.returnValue(false);
    auth.isAluno.and.returnValue(false);

    expect(component.isAdmin()).toBeTrue();
    expect(component.isPsicologo()).toBeFalse();
    expect(component.isAluno()).toBeFalse();
  });

  it('deve navegar e emitir no cadastrarAluno', (done) => {
    const sub = component.menuItemClicked.subscribe(() => {
      expect(router.navigateCalls.at(-1)).toEqual(['/cadastrar-aluno']);
      sub.unsubscribe();
      done();
    });
    component.cadastrarAluno();
  });

  it('deve navegar e emitir no editarAluno', (done) => {
    const sub = component.menuItemClicked.subscribe(() => {
      expect(router.navigateCalls.at(-1)).toEqual(['/editar-aluno']);
      sub.unsubscribe();
      done();
    });
    component.editarAluno();
  });

  it('deve navegar e emitir no cadastrarPsicologo', (done) => {
    const sub = component.menuItemClicked.subscribe(() => {
      expect(router.navigateCalls.at(-1)).toEqual(['/cadastrar-psicologo']);
      sub.unsubscribe();
      done();
    });
    component.cadastrarPsicologo();
  });

  it('deve navegar e emitir no editarPsicologo', (done) => {
    const sub = component.menuItemClicked.subscribe(() => {
      expect(router.navigateCalls.at(-1)).toEqual(['/editar-psicologo']);
      sub.unsubscribe();
      done();
    });
    component.editarPsicologo();
  });

  it('deve fazer logout, navegar para /auth e emitir no sair', (done) => {
    const sub = component.menuItemClicked.subscribe(() => {
      expect(auth.logout).toHaveBeenCalled();
      expect(router.navigateCalls.at(-1)).toEqual(['/auth']);
      sub.unsubscribe();
      done();
    });
    component.sair();
  });
});
