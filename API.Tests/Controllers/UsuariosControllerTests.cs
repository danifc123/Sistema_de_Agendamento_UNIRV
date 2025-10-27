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
    public class UsuariosControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly UsuariosController _controller;

        public UsuariosControllerTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _controller = new UsuariosController(_context);
            TestUsuarioHelper.SeedUsuariosData(_context);
        }

        #region GET /api/usuarios

        [Fact]
        public async Task GetUsuarios_ShouldReturnAllUsuarios()
        {
            // Act
            var result = await _controller.GetUsuarios();

            // Assert
            result.Value.Should().NotBeNull();
            result.Value.Should().HaveCount(5);
        }

        [Fact]
        public async Task GetUsuarios_ShouldReturnUsersWithCorrectTypes()
        {
            // Act
            var result = await _controller.GetUsuarios();

            // Assert
            result.Value.Should().NotBeNull();
            var usuarios = result.Value!.ToList();
            
            usuarios.Should().Contain(u => u.Tipo == TipoUsuario.Aluno);
            usuarios.Should().Contain(u => u.Tipo == TipoUsuario.Psicologo);
            usuarios.Should().Contain(u => u.Tipo == TipoUsuario.Admin);
        }

        #endregion

        #region GET /api/usuarios/{id}

        [Fact]
        public async Task GetUsuario_ExistingId_ShouldReturnUsuario()
        {
            // Act
            var result = await _controller.GetUsuario(1);

            // Assert
            result.Value.Should().NotBeNull();
            result.Value!.Id.Should().Be(1);
            result.Value.Nome.Should().Be("João Silva");
            result.Value.Email.Should().Be("joao.silva@teste.com");
        }

        [Fact]
        public async Task GetUsuario_NonExistingId_ShouldReturnNotFound()
        {
            // Act
            var result = await _controller.GetUsuario(999);

            // Assert
            result.Result.Should().BeOfType<NotFoundResult>();
        }

        #endregion

        #region POST /api/usuarios

        [Fact]
        public async Task PostUsuario_ValidUsuario_ShouldCreateSuccessfully()
        {
            // Arrange
            var usuario = TestUsuarioHelper.CreateValidUsuario();

            // Act
            var result = await _controller.PostUsuario(usuario);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdUsuario = (Usuario)createdResult.Value!;
            createdUsuario.Id.Should().BeGreaterThan(0);
            createdUsuario.Nome.Should().Be("Novo Usuário Teste");
            createdUsuario.Email.Should().Be("novo.usuario@teste.com"); // Deve estar normalizado
        }

        [Fact]
        public async Task PostUsuario_ShouldNormalizeEmailAndHashPassword()
        {
            // Arrange
            var usuario = new Usuario
            {
                Nome = "Teste Normalização",
                Email = "  EMAIL.MAIUSCULO@TESTE.COM  ", // Com espaços e maiúsculas
                Senha = "senha123",
                Tipo = TipoUsuario.Aluno
            };

            // Act
            var result = await _controller.PostUsuario(usuario);

            // Assert
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdUsuario = (Usuario)createdResult.Value!;
            
            // Email deve estar normalizado (lowercase e trimmed)
            createdUsuario.Email.Should().Be("email.maiusculo@teste.com");
            
            // Senha deve estar hasheada (não deve ser igual à original)
            createdUsuario.Senha.Should().NotBe("senha123");
            createdUsuario.Senha.Should().StartWith("$2"); // BCrypt hash format
        }

        [Fact]
        public async Task PostUsuario_ShouldBeAllowAnonymous()
        {
            // Arrange - Sem configurar claims (usuário anônimo)
            var usuario = TestUsuarioHelper.CreateValidUsuario();
            usuario.Email = "anonimo@teste.com";

            // Act
            var result = await _controller.PostUsuario(usuario);

            // Assert - Deve funcionar mesmo sem autenticação
            var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdUsuario = (Usuario)createdResult.Value!;
            createdUsuario.Email.Should().Be("anonimo@teste.com");
        }

        #endregion

        #region PUT /api/usuarios/{id}

        [Fact]
        public async Task PutUsuario_AsAdmin_ValidUpdate_ShouldReturnNoContent()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var updateData = TestUsuarioHelper.CreateUpdateData(
                nome: "Nome Atualizado",
                email: "email.atualizado@teste.com",
                tipo: TipoUsuario.Psicologo
            );

            // Act
            var result = await _controller.PutUsuario(1, updateData);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi atualizado
            var updatedUsuario = await _context.Usuarios.FindAsync(1);
            updatedUsuario!.Nome.Should().Be("Nome Atualizado");
            updatedUsuario.Email.Should().Be("email.atualizado@teste.com");
            updatedUsuario.Tipo.Should().Be(TipoUsuario.Psicologo);
        }

        [Fact]
        public async Task PutUsuario_AsAdmin_PartialUpdate_ShouldUpdateOnlyProvidedFields()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var updateData = TestUsuarioHelper.CreateUpdateData(nome: "Apenas Nome");

            // Act
            var result = await _controller.PutUsuario(1, updateData);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se apenas o nome foi atualizado
            var updatedUsuario = await _context.Usuarios.FindAsync(1);
            updatedUsuario!.Nome.Should().Be("Apenas Nome");
            updatedUsuario.Email.Should().Be("joao.silva@teste.com"); // Não deve ter mudado
            updatedUsuario.Tipo.Should().Be(TipoUsuario.Aluno); // Não deve ter mudado
        }

        [Fact]
        public async Task PutUsuario_AsAdmin_UpdatePassword_ShouldHashNewPassword()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var originalUsuario = await _context.Usuarios.FindAsync(1);
            var originalPasswordHash = originalUsuario!.Senha;
            
            var updateData = TestUsuarioHelper.CreateUpdateData(senha: "novasenha123");

            // Act
            var result = await _controller.PutUsuario(1, updateData);

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se a senha foi re-hasheada
            var updatedUsuario = await _context.Usuarios.FindAsync(1);
            updatedUsuario!.Senha.Should().NotBe(originalPasswordHash);
            updatedUsuario.Senha.Should().NotBe("novasenha123");
            updatedUsuario.Senha.Should().StartWith("$2"); // BCrypt hash format
        }

        [Fact]
        public async Task PutUsuario_NonExistingUsuario_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var updateData = TestUsuarioHelper.CreateUpdateData(nome: "Teste");

            // Act
            var result = await _controller.PutUsuario(999, updateData);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task PutUsuario_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);
            var updateData = TestUsuarioHelper.CreateUpdateData(nome: "Teste");

            // Act
            var result = await _controller.PutUsuario(1, updateData);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task PutUsuario_AsPsicologo_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 2, TipoUsuario.Psicologo);
            var updateData = TestUsuarioHelper.CreateUpdateData(nome: "Teste");

            // Act
            var result = await _controller.PutUsuario(1, updateData);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task PutUsuario_InvalidData_ShouldReturnBadRequest()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);
            var invalidData = "string inválida"; // Não é um objeto válido

            // Act
            var result = await _controller.PutUsuario(1, invalidData);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region DELETE /api/usuarios/{id}

        [Fact]
        public async Task DeleteUsuario_AsAdmin_ExistingUsuario_ShouldDeleteSuccessfully()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteUsuario(5); // Usuário que não é o admin

            // Assert
            result.Should().BeOfType<NoContentResult>();
            
            // Verificar se foi excluído
            var deletedUsuario = await _context.Usuarios.FindAsync(5);
            deletedUsuario.Should().BeNull();
        }

        [Fact]
        public async Task DeleteUsuario_AsAdmin_NonExistingUsuario_ShouldReturnNotFound()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 3, TipoUsuario.Admin);

            // Act
            var result = await _controller.DeleteUsuario(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task DeleteUsuario_AsNonAdmin_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 1, TipoUsuario.Aluno);

            // Act
            var result = await _controller.DeleteUsuario(2);

            // Assert
            result.Should().BeOfType<ForbidResult>();
        }

        [Fact]
        public async Task DeleteUsuario_AsPsicologo_ShouldReturnForbid()
        {
            // Arrange
            TestControllerHelper.SetupUserClaims(_controller, 2, TipoUsuario.Psicologo);

            // Act
            var result = await _controller.DeleteUsuario(1);

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