import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Aluno, AlunoFormData } from './aluno.interface';

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

    // Criar objeto com os dados do formulário
    const alunoData: AlunoFormData = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      matricula: this.matricula,
      curso: this.curso,
      semestre: this.semestre
    };

    // Aqui você implementará a lógica para cadastrar o aluno na API
    console.log('Cadastrando aluno:', alunoData);

    // TODO: Implementar chamada para API
    // this.alunoService.cadastrarAluno(alunoData).subscribe({
    //   next: (response) => {
    //     console.log('Aluno cadastrado com sucesso:', response);
    //     this.limparFormulario();
    //     alert('Aluno cadastrado com sucesso!');
    //   },
    //   error: (error) => {
    //     console.error('Erro ao cadastrar aluno:', error);
    //     alert('Erro ao cadastrar aluno. Tente novamente.');
    //   }
    // });

    // Por enquanto, apenas limpar o formulário
    this.limparFormulario();
    alert('Aluno cadastrado com sucesso! (Simulação)');
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
