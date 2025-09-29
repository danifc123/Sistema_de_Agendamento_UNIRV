using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestPsicologoHelper
    {
        public static void SeedPsicologosData(AppDbContext context)
        {
            // Limpar dados existentes
            context.Psicologos.RemoveRange(context.Psicologos);
            context.Usuarios.RemoveRange(context.Usuarios);
            context.SaveChanges();

            // Usuários
            var usuarios = new List<Usuario>
            {
                new() {
                    Id = 1,
                    Nome = "Dr. João Silva",
                    Email = "joao.silva@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 2,
                    Nome = "Dra. Maria Santos",
                    Email = "maria.santos@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 3,
                    Nome = "Dr. Pedro Costa",
                    Email = "pedro.costa@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
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
                    Nome = "Carlos Aluno",
                    Email = "carlos.aluno@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                }
            };

            context.Usuarios.AddRange(usuarios);

            // Psicólogos
            var psicologos = new List<Psicologo>
            {
                new() {
                    Id = 1,
                    Crp = "12345-SP",
                    Especialidade = "Psicologia Clínica"
                },
                new() {
                    Id = 2,
                    Crp = "23456-RJ",
                    Especialidade = "Psicologia Organizacional"
                },
                new() {
                    Id = 3,
                    Crp = "34567-MG",
                    Especialidade = "Psicologia Educacional"
                }
            };

            context.Psicologos.AddRange(psicologos);
            context.SaveChanges();
        }

        public static Psicologo CreateValidPsicologo()
        {
            return new Psicologo
            {
                Id = 10, // ID que não existe nos dados seed
                Crp = "99999-SP",
                Especialidade = "Neuropsicologia"
            };
        }

        public static Usuario CreateUsuarioForPsicologo(int id)
        {
            return new Usuario
            {
                Id = id,
                Nome = $"Dr. Novo Usuário {id}",
                Email = $"psicologo{id}@teste.com",
                Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                Tipo = TipoUsuario.Psicologo
            };
        }

        public static object CreateUpdateData(string? crp = null, string? especialidade = null)
        {
            var data = new Dictionary<string, object>();
            
            if (crp != null) data["Crp"] = crp;
            if (especialidade != null) data["Especialidade"] = especialidade;
            
            return data;
        }
    }
} 