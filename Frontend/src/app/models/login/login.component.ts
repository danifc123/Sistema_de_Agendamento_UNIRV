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

    // Verificar se é o usuário root
    if (this.loginData.email.toLowerCase() === 'root' && this.loginData.senha === '1234') {
      this.loading = true;
      this.errorMessage = '';

      // Simular login do usuário root
      const rootLoginData: LoginRequest = {
        email: 'root',
        senha: '1234'
      };

      console.log('Tentando login com:', rootLoginData);

      this.authService.login(rootLoginData).subscribe({
                next: (response) => {
          this.loading = false;
          console.log('Resposta do login:', response);

          if (response.Success) {
            console.log('Login bem-sucedido, redirecionando...');
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            console.log('URL de retorno:', returnUrl);
            this.router.navigate([returnUrl]);
          } else {
            this.errorMessage = response.Message;
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Erro no login:', error);
          this.errorMessage = 'Erro ao fazer login. Tente novamente.';
        }
      });
    } else {
      this.errorMessage = 'Credenciais inválidas. Use root/1234 para acesso de desenvolvedor.';
    }
  }
}
