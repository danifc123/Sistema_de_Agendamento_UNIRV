import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Output() menuItemClicked = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  cadastrarAluno(): void {
    this.router.navigate(['/cadastrar-aluno']);
    this.menuItemClicked.emit();
  }

  editarAluno(): void {
    this.router.navigate(['/editar-aluno']);
    this.menuItemClicked.emit();
  }

  cadastrarPsicologo(): void {
    this.router.navigate(['/cadastrar-psicologo']);
    this.menuItemClicked.emit();
  }

  editarPsicologo(): void {
    this.router.navigate(['/editar-psicologo']);
    this.menuItemClicked.emit();
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
    this.menuItemClicked.emit();
  }
}
