using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestUsuarioHelper
    {
        public static void SeedUsuariosData(AppDbContext context)
        {
            // Limpar dados existentes
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
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 3,
                    Nome = "Pedro Costa",
                    Email = "pedro.costa@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Admin
                },
                new() {
                    Id = 4,
                    Nome = "Ana Oliveira",
                    Email = "ana.oliveira@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Aluno
                },
                new() {
                    Id = 5,
                    Nome = "Carlos Ferreira",
                    Email = "carlos.ferreira@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                }
            };

            context.Usuarios.AddRange(usuarios);
            context.SaveChanges();
        }

        public static Usuario CreateValidUsuario()
        {
            return new Usuario
            {
                Nome = "Novo Usuário Teste",
                Email = "novo.usuario@teste.com",
                Senha = "123456", // Será hasheada pelo controller
                Tipo = TipoUsuario.Aluno
            };
        }

        public static object CreateUpdateData(string? nome = null, string? email = null, string? senha = null, TipoUsuario? tipo = null)
        {
            var data = new Dictionary<string, object>();
            
            if (nome != null) data["Nome"] = nome;
            if (email != null) data["Email"] = email;
            if (senha != null) data["Senha"] = senha;
            if (tipo.HasValue) data["Tipo"] = tipo.Value.ToString();
            
            return data;
        }
    }
} 