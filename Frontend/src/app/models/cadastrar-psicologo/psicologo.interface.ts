export interface Usuario {
  id?: number;           // Gerado automaticamente pelo banco
  nome: string;          // Campo obrigatório para preenchimento
  email: string;         // Campo obrigatório para preenchimento
  senha: string;         // Campo obrigatório para preenchimento
  tipo: string;          // Será definido automaticamente como 'psicologo'
}

export interface Psicologo {
  id?: number;           // Gerado automaticamente pelo banco
  crp: string;           // Campo obrigatório para preenchimento
  especialidade: string; // Campo obrigatório para preenchimento
  id_usuario?: number;   // Gerado automaticamente pelo banco
}

export interface PsicologoFormData {
  // Dados do usuário
  nome: string;
  email: string;
  senha: string;
  // Dados específicos do psicólogo
  crp: string;
  especialidade: string;
}
