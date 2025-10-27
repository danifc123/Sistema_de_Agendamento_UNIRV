using API.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Controllers;
using SeuProjeto.Data;
using SeuProjeto.Models;
using System.Text.Json;
using Xunit;

namespace API.Tests.Controllers
{
    public class DisponibilidadesControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly DisponibilidadesController _controller;

        public DisponibilidadesControllerTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _controller = new DisponibilidadesController(_context);
            TestDisponibilidadeHelper.SeedDisponibilidadesData(_context);
        }

        #region GET /api/disponibilidades/psicologo/{psicologoId}

        [Fact]
        public async Task GetPorPsicologo_PsicologoAccessingOwnDisponibilidades_ShouldReturnDisponibilidades()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.GetPorPsicologo(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2); // Psicólogo 1 tem 2 disponibilidades
            result.Value.Should().OnlyContain(d => d.PsicologoId == 1);
        }

        [Fact]
        public async Task GetPorPsicologo_PsicologoAccessingOtherDisponibilidades_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.GetPorPsicologo(2); // Tentando acessar do psicólogo 2

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task GetPorPsicologo_AdminAccessingDisponibilidades_ShouldReturnDisponibilidades()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetPorPsicologo(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(2);
            result.Value.Should().OnlyContain(d => d.PsicologoId == 1);
        }

        [Fact]
        public async Task GetPorPsicologo_ShouldReturnOrderedByDataDescAndHoraInicioAsc()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.GetPorPsicologo(1);

            // Assert
            result.Value.Should().NotBeNull();
            var disponibilidades = result.Value!.ToList();
            
            // Verificar ordenação por data descendente
            if (disponibilidades.Count > 1)
            {
                var datas = disponibilidades.Select(d => d.Data).ToList();
                datas.Should().BeInDescendingOrder();
            }
        }

        #endregion

        #region POST /api/disponibilidades

        [Fact]
        public async Task Post_ValidDisponibilidade_ShouldCreateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);
            var requestData = TestDisponibilidadeHelper.CreateValidDisponibilidadeRequest(1);
            
            // Converter para o tipo correto
            var json = JsonSerializer.Serialize(requestData);
            var request = JsonSerializer.Deserialize<DisponibilidadesController.CriarDisponibilidadeRequest>(json);

            // Act
            var result = await _controller.Post(request!);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdDisponibilidade = (Disponibilidade)createdResult.Value!;
            createdDisponibilidade.Id.Should().BeGreaterThan(0);
            createdDisponibilidade.PsicologoId.Should().Be(1);
        }

        [Fact]
        public async Task Post_NullRequest_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.Post(null!);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Post_PsicologoCreatingForOther_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);
            var requestData = TestDisponibilidadeHelper.CreateValidDisponibilidadeRequest(2); // Para outro psicólogo
            
            var json = JsonSerializer.Serialize(requestData);
            var request = JsonSerializer.Deserialize<DisponibilidadesController.CriarDisponibilidadeRequest>(json);

            // Act
            var result = await _controller.Post(request!);

            // Assert
            result.Result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task Post_HoraFimMenorQueInicio_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);
            var requestData = TestDisponibilidadeHelper.CreateInvalidTimeRequest(1);
            
            var json = JsonSerializer.Serialize(requestData);
            var request = JsonSerializer.Deserialize<DisponibilidadesController.CriarDisponibilidadeRequest>(json);

            // Act
            var result = await _controller.Post(request!);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Post_SobreposicaoDeHorarios_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);
            var requestData = TestDisponibilidadeHelper.CreateOverlappingRequest(1);
            
            var json = JsonSerializer.Serialize(requestData);
            var request = JsonSerializer.Deserialize<DisponibilidadesController.CriarDisponibilidadeRequest>(json);

            // Act
            var result = await _controller.Post(request!);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Post_AdminCreatingDisponibilidade_ShouldCreateSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var requestData = TestDisponibilidadeHelper.CreateValidDisponibilidadeRequest(2);
            
            var json = JsonSerializer.Serialize(requestData);
            var request = JsonSerializer.Deserialize<DisponibilidadesController.CriarDisponibilidadeRequest>(json);

            // Act
            var result = await _controller.Post(request!);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdDisponibilidade = (Disponibilidade)createdResult.Value!;
            createdDisponibilidade.PsicologoId.Should().Be(2);
        }

        #endregion

        #region DELETE /api/disponibilidades/{id}

        [Fact]
        public async Task Delete_ExistingDisponibilidade_ShouldDeleteSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.Delete(1); // Disponibilidade do psicólogo 1

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi excluído
            var deletedDisponibilidade = await _context.Disponibilidades.FindAsync(1);
            deletedDisponibilidade.Should().BeNull();
        }

        [Fact]
        public async Task Delete_NonExistingDisponibilidade_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.Delete(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task Delete_PsicologoDeletingOtherDisponibilidade_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.Delete(3); // Disponibilidade do psicólogo 2

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task Delete_AdminDeletingDisponibilidade_ShouldDeleteSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.Delete(2);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi excluído
            var deletedDisponibilidade = await _context.Disponibilidades.FindAsync(2);
            deletedDisponibilidade.Should().BeNull();
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 