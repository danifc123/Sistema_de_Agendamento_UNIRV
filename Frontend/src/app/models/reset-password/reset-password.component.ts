import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  novaSenha: string = '';
  confirmarSenha: string = '';
  token: string = '';
  loading: boolean = false;
  message: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.error = 'Token de redefinição inválido.';
    }
  }

  onSubmit(): void {
    this.error = '';
    this.message = '';

    if (!this.novaSenha || !this.confirmarSenha) {
      this.error = 'Por favor, preencha todos os campos.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.error = 'As senhas não coincidem.';
      return;
    }

    if (this.novaSenha.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    this.loading = true;

    this.authService.resetPassword(this.token, this.novaSenha).subscribe({
      next: (response) => {
        this.loading = false;
        this.message = response.message;
        setTimeout(() => {
          this.router.navigate(['/auth']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Erro ao redefinir senha. Tente novamente.';
      }
    });
  }
}
