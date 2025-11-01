import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  email = '';
  message = '';
  errorMessage = '';

  constructor(private authService: AuthService) {
    console.log('🔧 ForgetPasswordComponent inicializado');
  }

  onSubmit(): void {
    console.log('=== FORGET PASSWORD - onSubmit CHAMADO ===');
    this.message = '';
    this.errorMessage = '';
    const email = this.email?.trim();
    console.log('Email informado:', email);

    if (!email) {
      console.log('Email vazio, mostrando erro');
      this.errorMessage = 'Informe seu e-mail.';
      return;
    }

    console.log('Chamando authService.requestPasswordReset...');
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        console.log('✅ Sucesso na requisição:', response);
        this.message = 'Se o e-mail existir, enviaremos instruções para redefinir a senha.';
      },
      error: (err: any) => {
        console.error('❌ Erro ao solicitar redefinição:', err);
        console.error('Detalhes do erro:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        const backendMsg = err?.error?.message || err?.error?.Message;
        this.errorMessage = backendMsg || 'Não foi possível processar sua solicitação.';
      },
      complete: () => {
        console.log('Observable completado');
      }
    });
    console.log('Subscribe registrado, aguardando resposta...');
  }
}
