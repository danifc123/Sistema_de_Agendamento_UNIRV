import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Frontend';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    const currentUrl = this.router.url;

    // Se não estiver autenticado e não estiver na página de auth, redirecionar
    if (!this.authService.isAuthenticated() && !currentUrl.startsWith('/auth')) {
      this.router.navigate(['/auth'], { queryParams: { returnUrl: currentUrl } });
    } else if (this.authService.isAuthenticated() && currentUrl.startsWith('/auth')) {
      // Se estiver autenticado e na página de auth, redirecionar para home
      this.router.navigate(['/']);
    }
  }
}
