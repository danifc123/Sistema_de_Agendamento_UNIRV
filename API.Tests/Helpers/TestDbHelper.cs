using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestDbHelper
    {
        public static AppDbContext CreateInMemoryContext(string databaseName = "")
        {
            if (string.IsNullOrEmpty(databaseName))
                databaseName = Guid.NewGuid().ToString();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;

            var context = new AppDbContext(options);
            return context;
        }

        public static void SeedTestData(AppDbContext context)
        {
            // Usuários de teste
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
                    Nome = "Maria Psicóloga",
                    Email = "maria@teste.com", 
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 3,
                    Nome = "Admin Sistema",
                    Email = "admin@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Admin
                }
            };

            context.Usuarios.AddRange(usuarios);
            context.SaveChanges();
        }
    }
} 