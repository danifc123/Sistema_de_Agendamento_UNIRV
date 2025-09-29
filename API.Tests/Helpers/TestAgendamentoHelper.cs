using SeuProjeto.Data;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestAgendamentoHelper
    {
        public static void SeedAgendamentosData(AppDbContext context)
        {
            // Limpar dados existentes
            context.Agendamentos.RemoveRange(context.Agendamentos);
            context.Anotacoes.RemoveRange(context.Anotacoes);
            context.Disponibilidades.RemoveRange(context.Disponibilidades);
            context.Alunos.RemoveRange(context.Alunos);
            context.Psicologos.RemoveRange(context.Psicologos);
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
                    Nome = "Dr. Carlos",
                    Email = "carlos@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 4,
                    Nome = "Dra. Ana",
                    Email = "ana@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Psicologo
                },
                new() {
                    Id = 5,
                    Nome = "Admin Sistema",
                    Email = "admin@teste.com",
                    Senha = BCrypt.Net.BCrypt.HashPassword("123456"),
                    Tipo = TipoUsuario.Admin
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

            // Psicólogos
            var psicologos = new List<Psicologo>
            {
                new() {
                    Id = 3,
                    Crp = "12345-SP",
                    Especialidade = "Clínica"
                },
                new() {
                    Id = 4,
                    Crp = "54321-RJ",
                    Especialidade = "Organizacional"
                }
            };

            context.Psicologos.AddRange(psicologos);

            // Agendamentos
            var agendamentos = new List<Agendamento>
            {
                new() {
                    Id = 1,
                    AlunoId = 1,
                    PsicologoId = 3,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                    Horario = new TimeOnly(10, 0),
                    Status = StatusAgendamento.Pendente
                },
                new() {
                    Id = 2,
                    AlunoId = 2,
                    PsicologoId = 3,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                    Horario = new TimeOnly(14, 0),
                    Status = StatusAgendamento.Confirmado,
                    DataConfirmacao = DateTime.UtcNow.AddDays(-1)
                },
                new() {
                    Id = 3,
                    AlunoId = 1,
                    PsicologoId = 4,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                    Horario = new TimeOnly(16, 0),
                    Status = StatusAgendamento.Cancelado,
                    DataCancelamento = DateTime.UtcNow.AddHours(-2)
                }
            };

            context.Agendamentos.AddRange(agendamentos);

            // Disponibilidades (bloqueios)
            var disponibilidades = new List<Disponibilidade>
            {
                new() {
                    Id = 1,
                    PsicologoId = 3,
                    Data = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
                    HoraInicio = new TimeOnly(9, 0),
                    HoraFim = new TimeOnly(12, 0)
                }
            };

            context.Disponibilidades.AddRange(disponibilidades);

            context.SaveChanges();
        }

        public static Agendamento CreateValidAgendamento()
        {
            return new Agendamento
            {
                AlunoId = 1,
                PsicologoId = 3,
                Data = DateOnly.FromDateTime(DateTime.Today.AddDays(10)),
                Horario = new TimeOnly(15, 0),
                Status = StatusAgendamento.Pendente
            };
        }

        public static AgendamentoStatusUpdate CreateStatusUpdate(StatusAgendamento status)
        {
            return new AgendamentoStatusUpdate
            {
                Status = status
            };
        }
    }
} 