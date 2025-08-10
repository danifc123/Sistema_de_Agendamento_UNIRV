export interface Usuario {
  id?: number;           // Gerado automaticamente pelo banco
  nome: string;          // Campo obrigatório para preenchimento
  email: string;         // Campo obrigatório para preenchimento
  senha: string;         // Campo obrigatório para preenchimento
  tipo: string;          // Será definido automaticamente como 'aluno'
}

export interface Aluno {
  id?: number;           // Gerado automaticamente pelo banco
  matricula: string;     // Campo obrigatório para preenchimento
  curso: string;         // Campo obrigatório para preenchimento
  semestre: string;      // Campo obrigatório para preenchimento
  id_usuario?: number;   // Gerado automaticamente pelo banco
}

export interface AlunoFormData {
  // Dados do usuário
  nome: string;
  email: string;
  senha: string;
  // Dados específicos do aluno
  matricula: string;
  curso: string;
  semestre: string;
}
