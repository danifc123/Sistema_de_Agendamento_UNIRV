import { Component } from '@angular/core';
import { InputComponent } from "../../components/input/input.component";
import { ButtonComponent } from "../../components/button/button.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PsicologoFormData } from './psicologo.interface';

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

    // Criar objeto com os dados do formulário
    const psicologoData: PsicologoFormData = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      crp: this.crp,
      especialidade: this.especialidade
    };

    // Aqui você implementará a lógica para cadastrar o psicólogo na API
    console.log('Cadastrando psicólogo:', psicologoData);

    // TODO: Implementar chamada para API
    // this.psicologoService.cadastrarPsicologo(psicologoData).subscribe({
    //   next: (response) => {
    //     console.log('Psicólogo cadastrado com sucesso:', response);
    //     this.limparFormulario();
    //     alert('Psicólogo cadastrado com sucesso!');
    //   },
    //   error: (error) => {
    //     console.error('Erro ao cadastrar psicólogo:', error);
    //     alert('Erro ao cadastrar psicólogo. Tente novamente.');
    //   }
    // });

    // Por enquanto, apenas limpar o formulário
    this.limparFormulario();
    alert('Psicólogo cadastrado com sucesso! (Simulação)');
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
