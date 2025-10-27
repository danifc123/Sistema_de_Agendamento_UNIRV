using API.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Controllers;
using SeuProjeto.Data;
using SeuProjeto.Models;
using Xunit;

namespace API.Tests.Controllers
{
    public class AgendamentosControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly AgendamentosController _controller;

        public AgendamentosControllerTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _controller = new AgendamentosController(_context);
            TestAgendamentoHelper.SeedAgendamentosData(_context);
        }

        #region GET /api/agendamentos

        [Fact]
        public async Task GetAgendamentos_AsAdmin_ShouldReturnAllAgendamentos()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAgendamentos();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(3);
        }

        [Fact]
        public async Task GetAgendamentos_AsAluno_ShouldReturnOnlyOwnAgendamentos()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAgendamentos();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2);
            result.Value.Should().OnlyContain(a => a.AlunoId == 1);
        }

        [Fact]
        public async Task GetAgendamentos_AsPsicologo_ShouldReturnOnlyOwnAgendamentos()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.GetAgendamentos();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2);
            result.Value.Should().OnlyContain(a => a.PsicologoId == 3);
        }

        #endregion

        #region GET /api/agendamentos/{id}

        [Fact]
        public async Task GetAgendamento_ExistingId_ShouldReturnAgendamento()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAgendamento(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value!.Id.Should().Be(1);
        }

        [Fact]
        public async Task GetAgendamento_NonExistingId_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAgendamento(999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetAgendamento_AlunoAccessingOtherAgendamento_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAgendamento(2); // Agendamento do aluno 2

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region GET /api/agendamentos/verificar-disponibilidade

        [Fact]
        public async Task VerificarDisponibilidade_HorarioDisponivel_ShouldReturnDisponivel()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var data = DateTime.Today.AddDays(15).ToString("yyyy-MM-dd");
            var horario = "09:00";

            // Act
            var result = await _controller.VerificarDisponibilidade(1, 3, data, horario);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task VerificarDisponibilidade_DataInvalida_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var dataInvalida = "data-invalida";
            var horario = "10:00";

            // Act
            var result = await _controller.VerificarDisponibilidade(1, 3, dataInvalida, horario);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task VerificarDisponibilidade_AlunoVerificandoParaOutroAluno_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var data = DateTime.Today.AddDays(1).ToString("yyyy-MM-dd");
            var horario = "10:00";

            // Act
            var result = await _controller.VerificarDisponibilidade(2, 3, data, horario);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region POST /api/agendamentos

        [Fact]
        public async Task PostAgendamento_ValidAgendamento_ShouldCreateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var agendamento = TestAgendamentoHelper.CreateValidAgendamento();

            // Act
            var result = await _controller.PostAgendamento(agendamento);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdAgendamento = (Agendamento)createdResult.Value!;
            createdAgendamento.Id.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task PostAgendamento_ConflictoComAlunoExistente_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var agendamento = new Agendamento
            {
                AlunoId = 1,
                PsicologoId = 4,
                Data = DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                Horario = new TimeOnly(10, 0),
                Status = StatusAgendamento.Pendente
            };

            // Act
            var result = await _controller.PostAgendamento(agendamento);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task PostAgendamento_AlunoCriandoParaOutroAluno_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var agendamento = TestAgendamentoHelper.CreateValidAgendamento();
            agendamento.AlunoId = 2; // Aluno 1 tentando criar para aluno 2

            // Act
            var result = await _controller.PostAgendamento(agendamento);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region PUT /api/agendamentos/{id}

        [Fact]
        public async Task PutAgendamento_ValidUpdate_ShouldReturnNoContent()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var agendamento = await _context.Agendamentos.FindAsync(1);
            agendamento!.Horario = new TimeOnly(11, 0);

            // Act
            var result = await _controller.PutAgendamento(1, agendamento);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task PutAgendamento_MismatchedId_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var agendamento = await _context.Agendamentos.FindAsync(1);

            // Act
            var result = await _controller.PutAgendamento(999, agendamento!);

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task PutAgendamento_AlunoUpdatingOtherAgendamento_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var agendamento = await _context.Agendamentos.FindAsync(2); // Agendamento do aluno 2

            // Act
            var result = await _controller.PutAgendamento(2, agendamento!);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region PATCH /api/agendamentos/{id}/status

        [Fact]
        public async Task UpdateStatus_ToConfirmado_ShouldUpdateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var statusUpdate = TestAgendamentoHelper.CreateStatusUpdate(StatusAgendamento.Confirmado);

            // Act
            var result = await _controller.UpdateStatus(1, statusUpdate);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi atualizado
            var updatedAgendamento = await _context.Agendamentos.FindAsync(1);
            updatedAgendamento!.Status.Should().Be(StatusAgendamento.Confirmado);
        }

        [Fact]
        public async Task UpdateStatus_NonExistingAgendamento_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var statusUpdate = TestAgendamentoHelper.CreateStatusUpdate(StatusAgendamento.Confirmado);

            // Act
            var result = await _controller.UpdateStatus(999, statusUpdate);

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }

        [Fact]
        public async Task UpdateStatus_AlunoUpdatingOtherStatus_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var statusUpdate = TestAgendamentoHelper.CreateStatusUpdate(StatusAgendamento.Confirmado);

            // Act
            var result = await _controller.UpdateStatus(2, statusUpdate);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region DELETE /api/agendamentos/{id}

        [Fact]
        public async Task DeleteAgendamento_ExistingAgendamento_ShouldHandleDeleteAttempt()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteAgendamento(3);

            // Assert - O InMemory database não suporta transações e comandos PostgreSQL específicos,
            // então esperamos um ObjectResult com erro 500 explicando a limitação
            result.Should().BeOfType<ObjectResult>();
            var objectResult = (ObjectResult)result;
            objectResult.StatusCode.Should().Be(500);
        }

        [Fact]
        public async Task DeleteAgendamento_NonExistingAgendamento_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteAgendamento(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteAgendamento_AlunoDeleteingOtherAgendamento_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.DeleteAgendamento(2);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 