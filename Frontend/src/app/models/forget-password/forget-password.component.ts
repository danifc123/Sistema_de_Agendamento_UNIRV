import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, FormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  email = '';
  message = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.message = '';
    this.errorMessage = '';
    const email = this.email?.trim();
    if (!email) {
      this.errorMessage = 'Informe seu e-mail.';
      return;
    }

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.message = 'Se o e-mail existir, enviaremos instruções para redefinir a senha.';
      },
      error: (err: any) => {
        console.error('Erro ao solicitar redefinição:', err);
        const backendMsg = err?.error?.message || err?.error?.Message;
        this.errorMessage = backendMsg || 'Não foi possível processar sua solicitação.';
      }
    });
  }
}
