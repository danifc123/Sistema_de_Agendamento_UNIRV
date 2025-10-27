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
    public class AnotacoesControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly AnotacoesController _controller;

        public AnotacoesControllerTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _controller = new AnotacoesController(_context);
            TestAnotacaoHelper.SeedAnotacoesData(_context);
        }

        #region GET /api/anotacoes

        [Fact]
        public async Task GetAnotacoes_AsAdmin_ShouldReturnAllAnotacoes()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAnotacoes();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(4);
        }

        [Fact]
        public async Task GetAnotacoes_AsAluno_ShouldReturnOnlyOwnAnotacoes()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAnotacoes();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(3);
            result.Value.Should().OnlyContain(a => a.AlunoId == 1);
        }

        [Fact]
        public async Task GetAnotacoes_AsPsicologo_ShouldReturnOnlyOwnAnotacoes()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.GetAnotacoes();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2);
            result.Value.Should().OnlyContain(a => a.PsicologoId == 3);
        }

        #endregion

        #region GET /api/anotacoes/{id}

        [Fact]
        public async Task GetAnotacao_ExistingId_ShouldReturnAnotacao()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAnotacao(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value!.Id.Should().Be(1);
        }

        [Fact]
        public async Task GetAnotacao_NonExistingId_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAnotacao(999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetAnotacao_AlunoAccessingOtherAnotacao_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAnotacao(3); // Anotação do aluno 2

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region GET /api/anotacoes/aluno/{alunoId}

        [Fact]
        public async Task GetAnotacoesPorAluno_AlunoAccessingOwnAnotacoes_ShouldReturnAnotacoes()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAnotacoesPorAluno(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(3);
            result.Value.Should().OnlyContain(a => a.AlunoId == 1);
        }

        [Fact]
        public async Task GetAnotacoesPorAluno_AlunoAccessingOtherAnotacoes_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetAnotacoesPorAluno(2);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region GET /api/anotacoes/data/{data}/{alunoId}/{psicologoId}

        [Fact]
        public async Task GetAnotacoesPorData_ValidData_ShouldReturnAnotacoes()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var data = DateTime.Today.ToString("yyyy-MM-dd");

            // Act
            var result = await _controller.GetAnotacoesPorData(data, 1, 3);

            // Assert
            result.Value.Should().NotBeNull();
        }

        [Fact]
        public async Task GetAnotacoesPorData_InvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetAnotacoesPorData("data-invalida", 1, 3);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/anotacoes

        [Fact]
        public async Task PostAnotacao_ValidAnotacao_ShouldCreateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Psicologo);
            var anotacao = TestAnotacaoHelper.CreateValidAnotacao();

            // Act
            var result = await _controller.PostAnotacao(anotacao);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdAnotacao = (Anotacao)createdResult.Value!;
            createdAnotacao.Id.Should().BeGreaterThan(0);
        }

        [Fact]
        public async Task PostAnotacao_AlunoCriandoParaOutroAluno_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var anotacao = TestAnotacaoHelper.CreateValidAnotacao();
            anotacao.AlunoId = 2; // Outro aluno

            // Act
            var result = await _controller.PostAnotacao(anotacao);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region PUT /api/anotacoes/{id}

        [Fact]
        public async Task PutAnotacao_ValidUpdate_ShouldReturnNoContent()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Psicologo);
            var anotacao = await _context.Anotacoes.FindAsync(1);
            anotacao!.Descricao = "Descrição atualizada";

            // Act
            var result = await _controller.PutAnotacao(1, anotacao);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task PutAnotacao_MismatchedId_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);
            var anotacao = await _context.Anotacoes.FindAsync(1);

            // Act
            var result = await _controller.PutAnotacao(999, anotacao!);

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        #endregion

        #region DELETE /api/anotacoes/{id}

        [Fact]
        public async Task DeleteAnotacao_ExistingAnotacao_ShouldDeleteSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteAnotacao(4);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task DeleteAnotacao_NonExistingAnotacao_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 5, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteAnotacao(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 