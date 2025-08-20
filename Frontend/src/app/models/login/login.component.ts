import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [InputComponent, ButtonComponent, RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    senha: ''
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onLogin(): void {
    if (!this.loginData.email || !this.loginData.senha) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      email: this.loginData.email,
      senha: this.loginData.senha
    };

    console.log('Tentando login com:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Resposta do login:', response);

        if (response.Success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);
        } else {
          this.errorMessage = response.Message || 'Credenciais inválidas.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro no login:', error);
        // Tentar mostrar mensagem vinda do backend se existir
        const backendMsg = error?.error?.Message || error?.error?.message;
        this.errorMessage = backendMsg || 'Erro ao fazer login. Tente novamente.';
      }
    });
  }
}
