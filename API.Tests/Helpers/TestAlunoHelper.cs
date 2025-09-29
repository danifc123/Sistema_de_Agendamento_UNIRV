using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestAlunoHelper
    {
        public static void SeedAlunosData(AppDbContext context)
        {
            // Limpar dados existentes
            context.Alunos.RemoveRange(context.Alunos);
            context.Usuarios.RemoveRange(context.Usuarios);
            context.SaveChanges();

            // Usuários
            var usuarios = new List<Usuario>
            {
                new() {
                    Id = 1,
                    Nome = "João Silva",
                    Email = "joao.silva@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 2,
                    Nome = "Maria Santos",
                    Email = "maria.santos@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 3,
                    Nome = "Pedro Costa",
                    Email = "pedro.costa@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 4,
                    Nome = "Ana Admin",
                    Email = "ana.admin@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Admin
                },
                new() {
                    Id = 5,
                    Nome = "Carlos Psicólogo",
                    Email = "carlos.psi@teste.com",
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
                },
                new() {
                    Id = 3,
                    Matricula = "2024003",
                    Curso = "Direito",
                    Semestre = 7
                }
            };

            context.Alunos.AddRange(alunos);
            context.SaveChanges();
        }

        public static Aluno CreateValidAluno()
        {
            return new Aluno
            {
                Id = 10, // ID que não existe nos dados seed
                Matricula = "2024999",
                Curso = "Engenharia",
                Semestre = 2
            };
        }

        public static Usuario CreateUsuarioForAluno(int id)
        {
            return new Usuario
            {
                Id = id,
                Nome = $"Novo Usuário {id}",
                Email = $"usuario{id}@teste.com",
                Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                Tipo = TipoUsuario.Aluno
            };
        }

        public static object CreateUpdateData(string? matricula = null, string? curso = null, int? semestre = null)
        {
            var data = new Dictionary<string, object>();
            
            if (matricula != null) data["Matricula"] = matricula;
            if (curso != null) data["Curso"] = curso;
            if (semestre.HasValue) data["Semestre"] = semestre.Value;
            
            return data;
        }
    }
} 