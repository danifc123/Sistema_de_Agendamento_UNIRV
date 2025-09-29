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
    public class FormulariosSolicitacaoControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly FormulariosSolicitacaoController _controller;

        public FormulariosSolicitacaoControllerTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _controller = new FormulariosSolicitacaoController(_context);
            TestFormularioHelper.SeedFormulariosData(_context);
        }

        #region GET /api/formulariossolicitacao

        [Fact]
        public async Task GetFormulariosSolicitacao_AsAdmin_ShouldReturnAllFormularios()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetFormulariosSolicitacao();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(3);
            
            // Verificar se inclui entidades relacionadas
            var firstFormulario = result.Value!.First();
            firstFormulario.Aluno.Should().NotBeNull();
            firstFormulario.Aluno!.Usuario.Should().NotBeNull();
        }

        [Fact]
        public async Task GetFormulariosSolicitacao_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetFormulariosSolicitacao();

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task GetFormulariosSolicitacao_AsPsicologo_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 4, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.GetFormulariosSolicitacao();

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region GET /api/formulariossolicitacao/{id}

        [Fact]
        public async Task GetFormularioSolicitacao_AsAdmin_ExistingId_ShouldReturnFormulario()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetFormularioSolicitacao(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value!.Id.Should().Be(1);
            result.Value.Motivo.Should().Be("Solicitação de atendimento psicológico");
        }

        [Fact]
        public async Task GetFormularioSolicitacao_AsAdmin_NonExistingId_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetFormularioSolicitacao(999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task GetFormularioSolicitacao_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetFormularioSolicitacao(1);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region GET /api/formulariossolicitacao/aluno/{alunoId}

        [Fact]
        public async Task GetFormulariosPorAluno_AsAdmin_ShouldReturnFormulariosOrderedByDate()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetFormulariosPorAluno(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2); // Aluno 1 tem 2 formulários
            result.Value.Should().OnlyContain(f => f.AlunoId == 1);
            
            // Verificar ordenação por data descendente
            var formularios = result.Value!.ToList();
            if (formularios.Count > 1)
            {
                var datas = formularios.Select(f => f.DataEnvio).ToList();
                datas.Should().BeInDescendingOrder();
            }
        }

        [Fact]
        public async Task GetFormulariosPorAluno_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.GetFormulariosPorAluno(1);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region POST /api/formulariossolicitacao

        [Fact]
        public async Task PostFormularioSolicitacao_AsAdmin_ValidFormulario_ShouldCreateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var formulario = TestFormularioHelper.CreateValidFormulario();

            // Act
            var result = await _controller.PostFormularioSolicitacao(formulario);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdFormulario = (FormularioSolicitacao)createdResult.Value!;
            createdFormulario.Id.Should().BeGreaterThan(0);
            createdFormulario.Motivo.Should().Be("Nova solicitação de teste");
        }

        [Fact]
        public async Task PostFormularioSolicitacao_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var formulario = TestFormularioHelper.CreateValidFormulario();

            // Act
            var result = await _controller.PostFormularioSolicitacao(formulario);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region PUT /api/formulariossolicitacao/{id}

        [Fact]
        public async Task PutFormularioSolicitacao_AsAdmin_ValidUpdate_ShouldReturnNoContent()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var formulario = await _context.FormulariosSolicitacao.FindAsync(1);
            formulario!.Motivo = "Motivo atualizado";

            // Act
            var result = await _controller.PutFormularioSolicitacao(1, formulario);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi atualizado
            var updatedFormulario = await _context.FormulariosSolicitacao.FindAsync(1);
            updatedFormulario!.Motivo.Should().Be("Motivo atualizado");
        }

        [Fact]
        public async Task PutFormularioSolicitacao_AsAdmin_MismatchedId_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var formulario = await _context.FormulariosSolicitacao.FindAsync(1);

            // Act
            var result = await _controller.PutFormularioSolicitacao(999, formulario!); // ID diferente

            // Assert
            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task PutFormularioSolicitacao_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var formulario = await _context.FormulariosSolicitacao.FindAsync(1);

            // Act
            var result = await _controller.PutFormularioSolicitacao(1, formulario!);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        #endregion

        #region DELETE /api/formulariossolicitacao/{id}

        [Fact]
        public async Task DeleteFormularioSolicitacao_AsAdmin_ExistingFormulario_ShouldDeleteSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteFormularioSolicitacao(3);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi excluído
            var deletedFormulario = await _context.FormulariosSolicitacao.FindAsync(3);
            deletedFormulario.Should().BeNull();
        }

        [Fact]
        public async Task DeleteFormularioSolicitacao_AsAdmin_NonExistingFormulario_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteFormularioSolicitacao(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteFormularioSolicitacao_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.DeleteFormularioSolicitacao(1);

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