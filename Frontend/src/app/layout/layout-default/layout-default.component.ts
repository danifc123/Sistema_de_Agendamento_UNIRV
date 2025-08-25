import { Component, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { MenuComponent } from '../../components/menu/menu.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout-default',
  standalone: true,
  imports: [RouterModule, MenuComponent, CommonModule],
  templateUrl: './layout-default.component.html',
  styleUrl: './layout-default.component.scss'
})
export class LayoutDefaultComponent implements OnInit {
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }
  }

  isAluno(): boolean {
    return this.authService.isAluno();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

    @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Verificar se o clique foi fora do menu e da foto do usuário
    const target = event.target as HTMLElement;
    const menuContainer = target.closest('.user-menu-container');
    const menuComponent = target.closest('app-menu');

    // Se o clique foi fora do container do menu e o menu está aberto, fechar
    if (!menuContainer && !menuComponent && this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  onMenuItemClicked(): void {
    // Fechar o menu quando um item for clicado
    this.isMenuOpen = false;
  }
}
