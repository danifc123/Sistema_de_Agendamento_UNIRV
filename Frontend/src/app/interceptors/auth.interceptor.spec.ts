import { HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

class MockAuthService {
  token: string | null = null;
  getToken() { return this.token; }
  logout = jasmine.createSpy('logout');
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // HttpClient com o interceptor de função registrado corretamente
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        // Mocks
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router) as unknown as MockRouter;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar o header Authorization quando houver token', () => {
    authService.token = 'jwt-token';

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush({ ok: true });
  });

  it('não deve adicionar Authorization quando não houver token', () => {
    authService.token = null;

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ ok: true });
  });

  it('deve fazer logout e redirecionar ao receber 401 fora de /auth', (done) => {
    authService.token = 'jwt-token';

    http.get('/api/secure').subscribe({
      next: () => done.fail('deveria falhar com 401'),
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth']);
        done();
      }
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('deve propagar outros erros sem redirecionar', (done) => {
    http.get('/api/other').subscribe({
      next: () => done.fail('deveria falhar com 500'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }
    });

    const req = httpMock.expectOne('/api/other');
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Server Error' });
  });
});
