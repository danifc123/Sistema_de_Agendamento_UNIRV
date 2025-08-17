import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard: Verificando autenticação para:', state.url);
    console.log('AuthGuard: isAuthenticated =', this.authService.isAuthenticated());
    console.log('AuthGuard: Token =', this.authService.getToken());
    console.log('AuthGuard: CurrentUser =', this.authService.getCurrentUser());

    if (this.authService.isAuthenticated()) {
      console.log('AuthGuard: Acesso permitido');
      return true;
    }

    // Redirecionar para login se não estiver autenticado
    console.log('AuthGuard: Acesso negado, redirecionando para login');
    this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
