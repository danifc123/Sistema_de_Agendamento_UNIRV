import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PsicologoFormData } from './psicologo.interface';
import { UsuariosService } from '../../services/usuarios.service';
import { PsicologosService } from '../../services/psicologos.service';

@Component({
  selector: 'app-cadastrar-psicologo',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './cadastrar-psicologo.component.html',
  styleUrl: './cadastrar-psicologo.component.scss'
})
export class CadastrarPsicologoComponent {
  // Dados do usuário
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  // Dados específicos do psicólogo
  crp: string = '';
  especialidade: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private psicologosService: PsicologosService
  ) {}

  cadastrarPsicologo(): void {
    // Validar se todos os campos estão preenchidos
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha ||
        !this.crp || !this.especialidade) {
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

    // Primeiro, criar o usuário
    this.usuariosService.createUsuario({
      Nome: this.nome,
      Email: this.email,
      Senha: this.senha,
      Tipo: 'Psicologo'
    }).subscribe({
      next: (usuario) => {
        console.log('Usuário criado:', usuario);

        // Depois, criar o psicólogo com o mesmo ID
        this.psicologosService.createPsicologoComId(usuario.Id, {
          Crp: this.crp,
          Especialidade: this.especialidade
        }).subscribe({
          next: (psicologo) => {
            console.log('Psicólogo criado com sucesso:', psicologo);
            this.limparFormulario();
            alert('Psicólogo cadastrado com sucesso!');
          },
          error: (error) => {
            console.error('Erro detalhado ao criar psicólogo:', error);
            console.error('Status:', error.status);
            console.error('Mensagem:', error.message);
            console.error('Erro completo:', error.error);

            // Verificar se é um erro de validação (400) ou erro interno (500)
            if (error.status === 400) {
              alert(`Erro de validação: ${error.error}`);
            } else if (error.status === 500) {
              alert(`Erro interno do servidor: ${error.error}`);
            } else {
              alert('Erro ao criar dados do psicólogo. Tente novamente.');
            }
          }
        });
      },
      error: (error) => {
        console.error('Erro ao criar usuário:', error);
        alert('Erro ao criar usuário. Tente novamente.');
      }
    });
  }

  private limparFormulario(): void {
    // Limpar dados do usuário
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';

    // Limpar dados específicos do psicólogo
    this.crp = '';
    this.especialidade = '';
  }
}
