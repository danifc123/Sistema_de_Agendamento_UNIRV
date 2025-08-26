import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // Dados do formulário
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar(): void {
    // Validar se todos os campos estão preenchidos
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar se as senhas coincidem
    if (this.senha !== this.confirmarSenha) {
      alert('As senhas não coincidem. Tente novamente.');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Por favor, insira um email válido.');
      return;
    }

    // Validar se a senha tem pelo menos 6 caracteres
    if (this.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const registerData: RegisterRequest = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      confirmarSenha: this.confirmarSenha,
      tipo: 'Admin' // Fixo como Admin para este componente
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.Success) {
          alert('Administrador registrado com sucesso!');
          this.router.navigate(['/auth']);
        } else {
          // Caso raro de 200 com Success=false
          alert(`Erro no registro: ${response.Message || 'Verifique os dados informados.'}`);
        }
      },
      error: (error) => {
        console.error('Erro no registro:', error);
        const serverMessage = error?.error?.Message || error?.error?.message || error?.error;
        if (error.status === 400 && serverMessage) {
          alert(`Erro no registro: ${serverMessage}`);
        } else if (error.status === 400) {
          alert('Erro no registro (400). Verifique os dados informados.');
        } else {
          alert('Erro ao registrar administrador. Tente novamente.');
        }
      }
    });
  }

  limparFormulario(): void {
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';
  }
}
