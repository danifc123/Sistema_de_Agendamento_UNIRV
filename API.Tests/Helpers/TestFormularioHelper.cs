using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestFormularioHelper
    {
        public static void SeedFormulariosData(AppDbContext context)
        {
            // Limpar dados existentes
            context.FormulariosSolicitacao.RemoveRange(context.FormulariosSolicitacao);
            context.Alunos.RemoveRange(context.Alunos);
            context.Usuarios.RemoveRange(context.Usuarios);
            context.SaveChanges();

            // Usuários
            var usuarios = new List<Usuario>
            {
                new() {
                    Id = 1,
                    Nome = "João Aluno",
                    Email = "joao@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 2,
                    Nome = "Maria Aluna",
                    Email = "maria@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 3,
                    Nome = "Admin Sistema",
                    Email = "admin@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Admin
                },
                new() {
                    Id = 4,
                    Nome = "Dr. Carlos",
                    Email = "carlos@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                }
            };

            context.Usuarios.AddRange(usuarios);

            // Alunos
            var alunos = new List<Aluno>
            {
                new() {
                    Id = 1,
                    Matricula = "2024001",
                    Curso = "Psicologia",
                    Semestre = 5
                },
                new() {
                    Id = 2,
                    Matricula = "2024002",
                    Curso = "Administração",
                    Semestre = 3
                }
            };

            context.Alunos.AddRange(alunos);

            // Formulários de Solicitação
            var formularios = new List<FormularioSolicitacao>
            {
                new() {
                    Id = 1,
                    AlunoId = 1,
                    Motivo = "Solicitação de atendimento psicológico",
                    Observacoes = "Ansiedade relacionada aos estudos",
                    DataEnvio = DateOnly.FromDateTime(DateTime.Today.AddDays(-5))
                },
                new() {
                    Id = 2,
                    AlunoId = 1,
                    Motivo = "Reagendamento de consulta",
                    Observacoes = "Conflito de horário",
                    DataEnvio = DateOnly.FromDateTime(DateTime.Today.AddDays(-2))
                },
                new() {
                    Id = 3,
                    AlunoId = 2,
                    Motivo = "Primeira consulta",
                    Observacoes = "Orientação acadêmica",
                    DataEnvio = DateOnly.FromDateTime(DateTime.Today.AddDays(-1))
                }
            };

            context.FormulariosSolicitacao.AddRange(formularios);
            context.SaveChanges();
        }

        public static FormularioSolicitacao CreateValidFormulario()
        {
            return new FormularioSolicitacao
            {
                AlunoId = 1,
                Motivo = "Nova solicitação de teste",
                Observacoes = "Observações da solicitação",
                DataEnvio = DateOnly.FromDateTime(DateTime.Today)
            };
        }
    }
} 