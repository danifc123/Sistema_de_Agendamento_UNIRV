import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
// Tipagens locais não utilizadas removidas
import { UsuariosService } from '../../services/usuarios.service';
import { AlunosService } from '../../services/alunos.service';

@Component({
  selector: 'app-cadastrar-aluno',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, RouterModule, FormsModule],
  templateUrl: './cadastrar-aluno.component.html',
  styleUrl: './cadastrar-aluno.component.scss'
})
export class CadastrarAlunoComponent {

  // Dados do usuário
  nome: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  // Dados específicos do aluno
  matricula: string = '';
  curso: string = '';
  semestre: string = '';

  constructor(
    private usuariosService: UsuariosService,
    private alunosService: AlunosService
  ) {}

  cadastrarAluno(): void {
    // Validar se todos os campos estão preenchidos
    if (!this.nome || !this.email || !this.senha || !this.confirmarSenha ||
        !this.matricula || !this.curso || !this.semestre) {
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
      Tipo: 'Aluno'
    }).subscribe({
      next: (usuario) => {
        console.log('Usuário criado:', usuario);

        // Depois, criar o aluno com o mesmo ID
        console.log('ID do usuário criado:', usuario.Id);
        console.log('Dados do aluno a serem enviados:', {
          Id: usuario.Id,
          Matricula: this.matricula,
          Curso: this.curso,
          Semestre: parseInt(this.semestre)
        });

        this.alunosService.createAlunoComId(usuario.Id, {
          Matricula: this.matricula,
          Curso: this.curso,
          Semestre: parseInt(this.semestre)
        }).subscribe({
          next: (aluno) => {
            console.log('Aluno criado com sucesso:', aluno);
            this.limparFormulario();
            alert('Aluno cadastrado com sucesso!');
          },
          error: (error) => {
            console.error('Erro detalhado ao criar aluno:', error);
            console.error('Status:', error.status);
            console.error('Mensagem:', error.message);
            console.error('Erro completo:', error.error);

            // Verificar se é um erro de validação (400) ou erro interno (500)
            if (error.status === 400) {
              alert(`Erro de validação: ${error.error}`);
            } else if (error.status === 500) {
              alert(`Erro interno do servidor: ${error.error}`);
            } else {
              alert('Erro ao criar dados do aluno. Tente novamente.');
            }
          }
        });
      },
      error: (error) => {
        console.error('Erro ao criar usuário:', error);

        // Verificar se o backend retornou uma mensagem específica
        if (error.error?.message) {
          alert(error.error.message);
        } else if (error.status === 400) {
          alert('Erro de validação: Verifique os dados informados.');
        } else {
          alert('Erro ao criar usuário. Tente novamente.');
        }
      }
    });
  }

  private limparFormulario(): void {
    // Limpar dados do usuário
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.confirmarSenha = '';

    // Limpar dados específicos do aluno
    this.matricula = '';
    this.curso = '';
    this.semestre = '';
  }
}
