import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export function AuthInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthInterceptor: Interceptando requisição para:', request.url);

  // Adicionar token se disponível
  const token = authService.getToken();
  if (token) {
    request = addToken(request, token);
    console.log('AuthInterceptor: Token adicionado');
  } else {
    console.log('AuthInterceptor: Nenhum token encontrado');
  }

  return next(request).pipe(
    tap(response => {
      console.log('AuthInterceptor: Resposta recebida:', response);
    }),
    catchError((error: HttpErrorResponse) => {
      console.log('AuthInterceptor: Erro na requisição:', error);
      if (error.status === 401 && !request.url.includes('auth')) {
        authService.logout();
        router.navigate(['/auth']);
        return throwError(() => new Error('Token expirado'));
      }
      return throwError(() => error);
    })
  );
}

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}


