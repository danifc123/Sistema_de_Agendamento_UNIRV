import { Component, OnInit } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-editar-perfil',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule],
  templateUrl: './editar-perfil.component.html',
  styleUrl: './editar-perfil.component.scss'
})
export class EditarPerfilComponent implements OnInit {
  nome: string = '';
  email: string = '';
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarNovaSenha: string = '';

  private currentUser: UserInfo | null = null;

  constructor(
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se o usuário está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    // Verificar se é o usuário root (ID = -1)
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.Id === -1) {
      alert('O usuário root não pode editar o perfil através desta interface.');
      this.router.navigate(['/']);
      return;
    }

    // Carregar dados atuais do usuário
    this.carregarDadosUsuario();
  }

  private carregarDadosUsuario(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.nome = this.currentUser.Nome || '';
      this.email = this.currentUser.Email || '';
    }
  }

  salvarAlteracoes(): void {
    if (!this.currentUser) {
      alert('Usuário não encontrado. Faça login novamente.');
      this.router.navigate(['/auth']);
      return;
    }

    // Validar campos obrigatórios
    if (!this.nome || !this.email) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Por favor, insira um email válido.');
      return;
    }

    // Se o usuário preencheu campos de senha, validar
    if (this.senhaAtual || this.novaSenha || this.confirmarNovaSenha) {
      if (!this.senhaAtual) {
        alert('Para alterar a senha, é necessário informar a senha atual.');
        return;
      }

      if (!this.novaSenha) {
        alert('Por favor, digite a nova senha.');
        return;
      }

      if (this.novaSenha !== this.confirmarNovaSenha) {
        alert('As novas senhas não coincidem. Tente novamente.');
        return;
      }

      if (this.novaSenha.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {
      Nome: this.nome,
      Email: this.email
    };

    // Se o usuário preencheu a nova senha, incluir no objeto
    if (this.novaSenha) {
      dadosAtualizacao.Senha = this.novaSenha;
    }

    // Atualizar usuário
    this.usuariosService.updateUsuario(this.currentUser.Id, dadosAtualizacao).subscribe({
      next: (usuarioAtualizado) => {
        console.log('Usuário atualizado:', usuarioAtualizado);

        // Atualizar dados do usuário no AuthService
        const userInfoAtualizado: UserInfo = {
          Id: this.currentUser!.Id,
          Nome: usuarioAtualizado.Nome,
          Email: usuarioAtualizado.Email,
          Tipo: this.currentUser!.Tipo,
          Matricula: this.currentUser!.Matricula,
          Crp: this.currentUser!.Crp
        };

        // Atualizar no localStorage e no BehaviorSubject
        localStorage.setItem('user', JSON.stringify(userInfoAtualizado));
        this.authService['currentUserSubject'].next(userInfoAtualizado);

        alert('Perfil atualizado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erro ao atualizar usuário:', error);

        if (error.status === 400) {
          alert(`Erro de validação: ${error.error}`);
        } else if (error.status === 401) {
          alert('Sessão expirada. Faça login novamente.');
          this.authService.logout();
          this.router.navigate(['/auth']);
        } else {
          alert('Erro ao atualizar perfil. Tente novamente.');
        }
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/']);
  }
}
