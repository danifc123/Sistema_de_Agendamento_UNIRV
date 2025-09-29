using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestDisponibilidadeHelper
    {
        public static void SeedDisponibilidadesData(AppDbContext context)
        {
            // Limpar dados existentes
            context.Disponibilidades.RemoveRange(context.Disponibilidades);
            context.Psicologos.RemoveRange(context.Psicologos);
            context.Usuarios.RemoveRange(context.Usuarios);
            context.SaveChanges();

            // Usuários
            var usuarios = new List<Usuario>
            {
                new() {
                    Id = 1,
                    Nome = "Dr. João",
                    Email = "joao@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 2,
                    Nome = "Dra. Maria",
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

            // Psicólogos
            var psicologos = new List<Psicologo>
            {
                new() {
                    Id = 1,
                    Crp = "12345-SP",
                    Especialidade = "Clínica"
                },
                new() {
                    Id = 2,
                    Crp = "54321-RJ",
                    Especialidade = "Organizacional"
                }
            };

            context.Psicologos.AddRange(psicologos);

            // Disponibilidades
            var disponibilidades = new List<Disponibilidade>
            {
                new() {
                    Id = 1,
                    PsicologoId = 1,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                    HoraInicio = new TimeOnly(9, 0),
                    HoraFim = new TimeOnly(12, 0)
                },
                new() {
                    Id = 2,
                    PsicologoId = 1,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                    HoraInicio = new TimeOnly(14, 0),
                    HoraFim = new TimeOnly(16, 0)
                },
                new() {
                    Id = 3,
                    PsicologoId = 2,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                    HoraInicio = new TimeOnly(10, 0),
                    HoraFim = new TimeOnly(11, 0)
                }
            };

            context.Disponibilidades.AddRange(disponibilidades);
            context.SaveChanges();
        }

        public static object CreateValidDisponibilidadeRequest(int psicologoId = 1)
        {
            return new
            {
                PsicologoId = psicologoId,
                Data = DateTime.Today.AddDays(10).ToString("yyyy-MM-dd"),
                HoraInicio = "09:00",
                HoraFim = "12:00"
            };
        }

        public static object CreateInvalidTimeRequest(int psicologoId = 1)
        {
            return new
            {
                PsicologoId = psicologoId,
                Data = DateTime.Today.AddDays(10).ToString("yyyy-MM-dd"),
                HoraInicio = "12:00", // Hora início maior que fim
                HoraFim = "09:00"
            };
        }

        public static object CreateOverlappingRequest(int psicologoId = 1)
        {
            return new
            {
                PsicologoId = psicologoId,
                Data = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd"), // Mesma data dos dados seed
                HoraInicio = "10:00", // Sobrepõe com 09:00-12:00
                HoraFim = "11:00"
            };
        }
    }
} 