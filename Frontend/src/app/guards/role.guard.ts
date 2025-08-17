import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('RoleGuard: Verificando acesso para:', state.url);

    if (!this.authService.isAuthenticated()) {
      console.log('RoleGuard: Usuário não autenticado');
      this.router.navigate(['/auth']);
      return false;
    }

    // Verificar se a rota tem dados de roles
    const requiredRoles = route.data['roles'] as string[];
    console.log('RoleGuard: Roles necessárias:', requiredRoles);

    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('RoleGuard: Nenhuma role necessária, acesso permitido');
      return true;
    }

    // Verificar se o usuário tem pelo menos uma das roles necessárias
    const currentUser = this.authService.getCurrentUser();
    console.log('RoleGuard: Usuário atual:', currentUser);

    const hasRequiredRole = requiredRoles.some(role => {
      const hasRole = this.authService.hasRole(role);
      console.log(`RoleGuard: Verificando role '${role}': ${hasRole}`);
      return hasRole;
    });

    if (hasRequiredRole) {
      console.log('RoleGuard: Acesso permitido');
      return true;
    }

    // Redirecionar para página de acesso negado se não tiver permissão
    console.log('RoleGuard: Acesso negado, redirecionando');
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
