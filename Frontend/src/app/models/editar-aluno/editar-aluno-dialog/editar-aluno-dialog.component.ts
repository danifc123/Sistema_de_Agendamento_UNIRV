import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InputComponent } from '../../../components/input/input.component';
import { AlunosService } from '../../../services/alunos.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { HttpClient } from '@angular/common/http';

export interface EditarAlunoDialogData {
  aluno: {
    id: string;
    nome: string;
    email: string;
    matricula: string;
    curso: string;
    semestre: string;
  };
}

@Component({
  selector: 'app-editar-aluno-dialog',
  standalone: true,
  imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, InputComponent],
  templateUrl: './editar-aluno-dialog.component.html',
  styleUrl: './editar-aluno-dialog.component.scss'
})
export class EditarAlunoDialogComponent {
  alunoNome: string;
  email: string;
  matricula: string;
  curso: string;
  semestre: string;

  constructor(
    public dialogRef: MatDialogRef<EditarAlunoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditarAlunoDialogData,
    private alunosService: AlunosService,
    private usuariosService: UsuariosService,
    private http: HttpClient
  ) {
    this.alunoNome = dialogData.aluno.nome;
    this.email = dialogData.aluno.email;
    this.matricula = dialogData.aluno.matricula;
    this.curso = dialogData.aluno.curso;
    this.semestre = dialogData.aluno.semestre;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    // Validação básica
    if (!this.alunoNome || !this.email || !this.matricula || !this.curso || !this.semestre) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Por favor, insira um email válido.');
      return;
    }

    // Validação de semestre
    const semestreNum = parseInt(this.semestre);
    if (isNaN(semestreNum) || semestreNum < 1 || semestreNum > 10) {
      alert('Por favor, insira um semestre válido (1-10).');
      return;
    }

    const alunoId = parseInt(this.dialogData.aluno.id);

    // Primeiro, buscar os dados atuais do usuário para manter a senha
    this.usuariosService.getUsuario(alunoId).subscribe({
      next: (usuarioAtual) => {

        // Atualizar usuário usando o endpoint PUT correto
        const dadosUsuario = {
          Nome: this.alunoNome,
          Email: this.email
        };

        // Atualizar usuário usando o endpoint PUT
        this.usuariosService.updateUsuario(alunoId, dadosUsuario).subscribe({
          next: (usuarioResponse) => {

            // Depois, atualizar o aluno
            const dadosAluno = {
              Matricula: this.matricula,
              Curso: this.curso,
              Semestre: semestreNum
            };

            this.alunosService.updateAluno(alunoId, dadosAluno).subscribe({
              next: (alunoResponse) => {
                alert('Aluno atualizado com sucesso!');

                // Retornar dados atualizados para o componente pai
                this.dialogRef.close({
                  id: this.dialogData.aluno.id,
                  nome: this.alunoNome,
                  email: this.email,
                  matricula: this.matricula,
                  curso: this.curso,
                  semestre: this.semestre
                });
              },
              error: (alunoError) => {
                alert('Erro ao atualizar dados do aluno. Tente novamente.');
              }
            });
          },
          error: (usuarioError) => {
            alert('Erro ao atualizar dados do usuário. Tente novamente.');
          }
        });
      },
      error: (error) => {
        alert('Erro ao buscar dados do usuário. Tente novamente.');
      }
    });
  }
}
