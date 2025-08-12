import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { InputComponent } from '../../../components/input/input.component';
import { PsicologosService } from '../../../services/psicologos.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { HttpClient } from '@angular/common/http';

export interface EditarPsicologoDialogData {
  psicologo: {
    id: string;
    nome: string;
    email: string;
    crp: string;
    especialidade: string;
  };
}

@Component({
  selector: 'app-editar-psicologo-dialog',
  standalone: true,
  imports: [MatDialogModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, InputComponent],
  templateUrl: './editar-psicologo-dialog.component.html',
  styleUrl: './editar-psicologo-dialog.component.scss'
})
export class EditarPsicologoDialogComponent {
  nome: string;
  email: string;
  crp: string;
  especialidade: string;

  constructor(
    public dialogRef: MatDialogRef<EditarPsicologoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: EditarPsicologoDialogData,
    private psicologosService: PsicologosService,
    private usuariosService: UsuariosService,
    private http: HttpClient
  ) {
    this.nome = dialogData.psicologo.nome;
    this.email = dialogData.psicologo.email;
    this.crp = dialogData.psicologo.crp;
    this.especialidade = dialogData.psicologo.especialidade;
  }

  fechar(): void {
    this.dialogRef.close();
  }

  salvar(): void {
    // Validação básica
    if (!this.nome || !this.email || !this.crp || !this.especialidade) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Por favor, insira um email válido.');
      return;
    }

    // Validação de CRP (mais flexível - permite diferentes formatos)
    const crpRegex = /^\d{2}[\/\-\.]?\d{6}$/;
    if (!crpRegex.test(this.crp.replace(/\s/g, ''))) {
      alert('Por favor, insira um CRP válido (ex: 06/123456, 06-123456, 06.123456).');
      return;
    }

    const psicologoId = parseInt(this.dialogData.psicologo.id);

    // Primeiro, buscar os dados atuais do usuário para manter a senha
    this.usuariosService.getUsuario(psicologoId).subscribe({
      next: (usuarioAtual) => {

        // Atualizar usuário
        const dadosUsuario = {
          Nome: this.nome,
          Email: this.email
        };


        // Atualizar usuário usando o endpoint PUT
        this.http.put(`http://localhost:5160/api/usuarios/${psicologoId}`, dadosUsuario).subscribe({
          next: (usuarioResponse) => {

            // Depois, atualizar o psicólogo
            const dadosPsicologo = {
              Crp: this.crp,
              Especialidade: this.especialidade
            };


            this.psicologosService.updatePsicologo(psicologoId, dadosPsicologo).subscribe({
              next: (psicologoResponse) => {
                alert('Psicólogo atualizado com sucesso!');

                // Retornar dados atualizados para o componente pai
                this.dialogRef.close({
                  id: this.dialogData.psicologo.id,
                  nome: this.nome,
                  email: this.email,
                  crp: this.crp,
                  especialidade: this.especialidade
                });
              },
              error: (psicologoError) => {
                alert('Erro ao atualizar dados do psicólogo. Tente novamente.');
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
