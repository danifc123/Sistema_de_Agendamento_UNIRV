import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { AgendamentosService } from '../../services/agendamentos.service';
import { AlunosService } from '../../services/alunos.service';
import { PsicologosService } from '../../services/psicologos.service';
import { AuthService } from '../../services/auth.service';
import { DisponibilidadesService } from '../../services/disponibilidades.service';

class MockAgendamentosService {
  getAgendamentos = jasmine.createSpy('getAgendamentos').and.returnValue(of([]));
  createAgendamento = jasmine.createSpy('createAgendamento').and.returnValue(of({ Id: 1 }));
  verificarDisponibilidade = jasmine.createSpy('verificarDisponibilidade').and.returnValue(of({ disponivel: true, message: 'OK' }));
}

class MockAlunosService {
  getAlunos = jasmine.createSpy('getAlunos').and.returnValue(of([
    { Id: 1, Usuario: { Nome: 'Aluno 1' } },
    { Id: 2, Usuario: { Nome: 'Aluno 2' } }
  ]));
}

class MockPsicologosService {
  getPsicologos = jasmine.createSpy('getPsicologos').and.returnValue(of([
    { Id: 10, Usuario: { Nome: 'Psico 1' } },
    { Id: 20, Usuario: { Nome: 'Psico 2' } }
  ]));
}

class MockAuthService {
  isAdmin = jasmine.createSpy('isAdmin').and.returnValue(false);
  isPsicologo = jasmine.createSpy('isPsicologo').and.returnValue(false);
  isAluno = jasmine.createSpy('isAluno').and.returnValue(false);
  getCurrentUser = jasmine.createSpy('getCurrentUser').and.returnValue({ Id: 99, Nome: 'Psico Logado' });
}

class MockDisponibilidadesService {
  listarPorPsicologo = jasmine.createSpy('listarPorPsicologo').and.returnValue(of([
    { Data: '2025-10-10', HoraInicio: '08:00', HoraFim: '09:00' },
    { Data: '2025-10-11', HoraInicio: '10:00', HoraFim: '11:00' }
  ]));
  criarBloqueio = jasmine.createSpy('criarBloqueio').and.returnValue(of({}));
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let agService: MockAgendamentosService;
  let dispService: MockDisponibilidadesService;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AgendamentosService, useClass: MockAgendamentosService },
        { provide: AlunosService, useClass: MockAlunosService },
        { provide: PsicologosService, useClass: MockPsicologosService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: DisponibilidadesService, useClass: MockDisponibilidadesService },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    });

    // Evitar renderização do template e de componentes filhos
    TestBed.overrideComponent(HomeComponent, {
      set: { template: '<div></div>', imports: [] }
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    agService = TestBed.inject(AgendamentosService) as unknown as MockAgendamentosService;
    dispService = TestBed.inject(DisponibilidadesService) as unknown as MockDisponibilidadesService;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;

    spyOn(window, 'alert');

    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar alunos, psicologos e agendamentos no init', () => {
    expect(agService.getAgendamentos).toHaveBeenCalled();
  });

  it('agendarConsulta deve validar campos obrigatórios', () => {
    component.alunoSelecionado = '';
    component.psicologoSelecionado = '';
    component.horario = '';
    component.data = '';

    component.agendarConsulta();

    expect(window.alert).toHaveBeenCalled();
    expect(agService.verificarDisponibilidade).not.toHaveBeenCalled();
  });

  it('agendarConsulta deve verificar disponibilidade e criar agendamento quando disponível', () => {
    component.alunoSelecionado = '1';
    component.psicologoSelecionado = '10';
    component.horario = '14:00';
    component.data = '2025-10-10';
    component.tabelaAgendamento = { recarregarDados: jasmine.createSpy('recarregarDados') } as any;

    agService.verificarDisponibilidade.and.returnValue(of({ disponivel: true, message: 'OK' }));
    agService.createAgendamento.and.returnValue(of({ Id: 1 }));

    component.agendarConsulta();

    expect(agService.verificarDisponibilidade).toHaveBeenCalled();
    expect(agService.createAgendamento).toHaveBeenCalled();
    expect(component.tabelaAgendamento.recarregarDados).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Agendamento realizado com sucesso!');
  });

  it('agendarConsulta deve exibir alerta e não criar quando indisponível', () => {
    component.alunoSelecionado = '1';
    component.psicologoSelecionado = '10';
    component.horario = '14:00';
    component.data = '2025-10-10';

    agService.verificarDisponibilidade.and.returnValue(of({ disponivel: false, message: 'Indisponível' }));

    component.agendarConsulta();

    expect(window.alert).toHaveBeenCalledWith('Indisponível');
    expect(agService.createAgendamento).not.toHaveBeenCalled();
  });

  it('onDataSelecionada deve popular data e carregar bloqueios do dia', () => {
    component.psicologoSelecionado = '10';
    dispService.listarPorPsicologo.and.returnValue(of([
      { Data: '2025-10-10', HoraInicio: '08:00', HoraFim: '09:00' },
      { Data: '2025-10-10', HoraInicio: '09:00', HoraFim: '10:00' }
    ]));

    component.onDataSelecionada({ dataISO: '2025-10-10', dataExibicao: '10/10/2025' });

    expect(component.data).toBe('2025-10-10');
    expect(component.bloqueiosDia.length).toBe(2);
  });

  it('verificarDisponibilidadeHorario deve limpar horário quando indisponível', () => {
    component.alunoSelecionado = '1';
    component.psicologoSelecionado = '10';
    component.data = '2025-10-10';
    component.horario = '14:00';

    agService.verificarDisponibilidade.and.returnValue(of({ disponivel: false, message: 'Conflito' }));

    component.verificarDisponibilidadeHorario();

    expect(component.horario).toBe('');
    expect(window.alert).toHaveBeenCalled();
  });

  it('bloquearHorario deve validar campos e exibir alerta quando inválido', () => {
    component.data = '';
    component.horaInicio = '';
    component.horaFim = '';

    component.bloquearHorario();
    expect(window.alert).toHaveBeenCalled();

    (window.alert as jasmine.Spy).calls.reset();
    component.data = '2025-10-10';
    component.horaInicio = '10:00';
    component.horaFim = '09:00';
    component.bloquearHorario();
    expect(window.alert).toHaveBeenCalledWith('Hora fim deve ser maior que hora início.');
  });

  it('bloquearHorario deve criar bloqueio quando válido', () => {
    authService.getCurrentUser.and.returnValue({ Id: 99 } as any);
    component.data = '2025-10-10';
    component.horaInicio = '08:00';
    component.horaFim = '09:00';

    dispService.criarBloqueio.and.returnValue(of({}));
    spyOn(component, 'onDataSelecionada');

    component.bloquearHorario();

    expect(dispService.criarBloqueio).toHaveBeenCalled();
    expect(component.horaInicio).toBe('');
    expect(component.horaFim).toBe('');
    expect(component.onDataSelecionada).toHaveBeenCalledWith({ dataISO: '2025-10-10', dataExibicao: '' });
  });

  it('bloquearHorario deve exibir mensagem de erro do backend', () => {
    authService.getCurrentUser.and.returnValue({ Id: 99 } as any);
    component.data = '2025-10-10';
    component.horaInicio = '08:00';
    component.horaFim = '09:00';

    dispService.criarBloqueio.and.returnValue(throwError(() => ({ error: { message: 'Erro backend' } })));

    component.bloquearHorario();

    expect(window.alert).toHaveBeenCalledWith('Erro backend');
  });
});
