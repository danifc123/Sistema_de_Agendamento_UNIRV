import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  @Output() menuItemClicked = new EventEmitter<void>();

  constructor(private router: Router) {}

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
    // Implementar lógica de logout quando necessário
    console.log('Sair - funcionalidade a ser implementada');
    this.menuItemClicked.emit();
  }
}
