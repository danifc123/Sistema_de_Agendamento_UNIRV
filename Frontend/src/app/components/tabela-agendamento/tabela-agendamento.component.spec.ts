import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TabelaAgendamentoComponent, AgendamentoDisplay } from './tabela-agendamento.component';
import { AgendamentosService } from '../../services/agendamentos.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';

class MockAgendamentosService {
  getAgendamentos = jasmine.createSpy('getAgendamentos').and.returnValue(of([]));
  updateAgendamento = jasmine.createSpy('updateAgendamento').and.returnValue(of({}));
  aceitarAgendamento = jasmine.createSpy('aceitarAgendamento').and.returnValue(of({}));
  deleteAgendamento = jasmine.createSpy('deleteAgendamento').and.returnValue(of({}));
}

class MockAuthService {
  currentUser$ = of(null);
  isAluno = jasmine.createSpy('isAluno').and.returnValue(false);
  isPsicologo = jasmine.createSpy('isPsicologo').and.returnValue(false);
}

class MockDialogRef {
  afterClosed() { return of(null); }
}

class MockMatDialog {
  open() { return new MockDialogRef(); }
}

describe('TabelaAgendamentoComponent', () => {
  let component: TabelaAgendamentoComponent;
  let fixture: ComponentFixture<TabelaAgendamentoComponent>;
  let agService: MockAgendamentosService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaAgendamentoComponent],
      providers: [
        { provide: AgendamentosService, useClass: MockAgendamentosService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockMatDialog }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Garante que o MatDialog mockado seja usado (evita abrir componentes reais)
    TestBed.overrideProvider(MatDialog, { useValue: new MockMatDialog() });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(TabelaAgendamentoComponent);
    component = fixture.componentInstance;
    agService = TestBed.inject(AgendamentosService) as unknown as MockAgendamentosService;
    dialog = TestBed.inject(MatDialog);

    // Spy padrão: nunca chamar MatDialog real
    spyOn(dialog, 'open').and.returnValue(new MockDialogRef() as any);

    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar agendamentos no init', () => {
    expect(agService.getAgendamentos).toHaveBeenCalled();
  });

  it('recarregarDados deve chamar carregarAgendamentos', () => {
    spyOn(component, 'carregarAgendamentos' as any);
    component.recarregarDados();
    expect(component['carregarAgendamentos']).toHaveBeenCalled();
  });

  it('onAceitar deve aceitar consulta quando pendente', () => {
    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.onAceitar(row);
    expect(agService.aceitarAgendamento).toHaveBeenCalledWith(1);
  });

  it('onAceitar deve alertar quando já confirmado', () => {
    spyOn(window, 'alert');
    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Confirmado', AlunoId: 1, PsicologoId: 2
    };

    component.onAceitar(row);
    expect(window.alert).toHaveBeenCalled();
    expect(agService.aceitarAgendamento).not.toHaveBeenCalled();
  });

  it('onEdit deve abrir dialog e atualizar quando houver retorno', () => {
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ id: 1, alunoId: 1, psicologoId: 2, data: '2025-10-10', horario: '14:00', status: 'Pendente' }) } as any);

    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.onEdit(row);
    expect(agService.updateAgendamento).toHaveBeenCalled();
  });

  it('onEdit deve lidar com erro no update', () => {
    (dialog.open as jasmine.Spy).and.returnValue({ afterClosed: () => of({ id: 1, alunoId: 1, psicologoId: 2, data: '2025-10-10', horario: '14:00', status: 'Pendente' }) } as any);
    agService.updateAgendamento.and.returnValue(throwError(() => new Error('erro')));
    spyOn(window, 'alert');

    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.onEdit(row);
    expect(window.alert).toHaveBeenCalled();
  });

  it('onInfo deve abrir dialog de informações', () => {
    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.onInfo(row);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('excluirAgendamento deve confirmar e excluir', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');

    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.excluirAgendamento(row);
    expect(agService.deleteAgendamento).toHaveBeenCalledWith(1);
    expect(window.alert).toHaveBeenCalled();
  });

  it('excluirAgendamento não deve excluir se cancelar', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const row: AgendamentoDisplay = {
      Id: 1, Data: '10/10/2025', Horario: '14:00', AlunoNome: 'A', PsicologoNome: 'P', Status: 'Pendente', AlunoId: 1, PsicologoId: 2
    };

    component.excluirAgendamento(row);
    expect(agService.deleteAgendamento).not.toHaveBeenCalled();
  });
});
