import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AgendamentosService, Agendamento } from './agendamentos.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('AgendamentosService', () => {
  let service: AgendamentosService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  const mockAgendamento: Agendamento = {
    Id: 1,
    AlunoId: 10,
    PsicologoId: 20,
    Data: '2025-10-10',
    Horario: '14:00',
    Status: 'Pendente',
    DataCriacao: '2025-10-01T10:00:00'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AgendamentosService, ApiService]
    });

    service = TestBed.inject(AgendamentosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAgendamentos', () => {
    it('should return a list of agendamentos', () => {
      const expected = [mockAgendamento];

      service.getAgendamentos().subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('getAgendamento', () => {
    it('should return one agendamento by id', () => {
      service.getAgendamento(1).subscribe(result => {
        expect(result).toEqual(mockAgendamento);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAgendamento);
    });
  });

  describe('getAgendamentosPorAluno', () => {
    it('should call correct endpoint', () => {
      const expected = [mockAgendamento];

      service.getAgendamentosPorAluno(10).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/aluno/10`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('getAgendamentosPorPsicologo', () => {
    it('should call correct endpoint', () => {
      const expected = [mockAgendamento];

      service.getAgendamentosPorPsicologo(20).subscribe(result => {
        expect(result).toEqual(expected);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/psicologo/20`);
      expect(req.request.method).toBe('GET');
      req.flush(expected);
    });
  });

  describe('createAgendamento', () => {
    it('should POST a new agendamento via ApiService', () => {
      const payload: Omit<Agendamento, 'Id' | 'DataCriacao'> = {
        AlunoId: 10,
        PsicologoId: 20,
        Data: '2025-10-10',
        Horario: '14:00',
        Status: 'Pendente'
      };

      service.createAgendamento(payload).subscribe(result => {
        expect(result).toEqual(mockAgendamento);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockAgendamento);
    });
  });

  describe('updateAgendamento', () => {
    it('should PUT partial updates via ApiService', () => {
      const update: Partial<Agendamento> = { Status: 'Confirmado' };

      service.updateAgendamento(1, update).subscribe(result => {
        expect(result).toEqual({ ...mockAgendamento, ...update });
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockAgendamento, ...update });
    });
  });

  describe('updateStatus', () => {
    it('should PATCH status via ApiService', () => {
      service.updateStatus(1, 'Confirmado').subscribe(result => {
        expect(result).toEqual({ ...mockAgendamento, Status: 'Confirmado' });
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ Status: 'Confirmado' });
      req.flush({ ...mockAgendamento, Status: 'Confirmado' });
    });
  });

  describe('aceitarAgendamento', () => {
    it('should PATCH /agendamentos/{id}/status to Confirmado', () => {
      service.aceitarAgendamento(1).subscribe(() => {
        expect(true).toBeTrue();
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ Status: 'Confirmado' });
      req.flush(null);
    });
  });

  describe('deleteAgendamento', () => {
    it('should DELETE an agendamento via ApiService', () => {
      service.deleteAgendamento(1).subscribe(result => {
        expect(result).toEqual(mockAgendamento);
      });

      const req = httpMock.expectOne(`${baseUrl}/agendamentos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockAgendamento);
    });
  });

  describe('verificarDisponibilidade', () => {
    it('should call GET /agendamentos/verificar-disponibilidade with query params', () => {
      const alunoId = 10;
      const psicologoId = 20;
      const data = '2025-10-10';
      const horario = '14:00';

      service.verificarDisponibilidade(alunoId, psicologoId, data, horario)
        .subscribe(result => {
          expect(result.disponivel).toBeTrue();
          expect(result.message).toBe('OK');
        });

      const req = httpMock.expectOne(r => {
        if (!r.urlWithParams.startsWith(`${baseUrl}/agendamentos/verificar-disponibilidade`)) return false;
        const url = new URL(r.urlWithParams);
        return (
          url.searchParams.get('alunoId') === alunoId.toString() &&
          url.searchParams.get('psicologoId') === psicologoId.toString() &&
          url.searchParams.get('data') === data &&
          url.searchParams.get('horario') === horario
        );
      });
      expect(req.request.method).toBe('GET');
      req.flush({ disponivel: true, message: 'OK' });
    });
  });
});
