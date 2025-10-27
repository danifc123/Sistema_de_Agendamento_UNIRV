using API.Tests.Helpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SeuProjeto.Data;
using SeuProjeto.Models;
using SeuProjeto.Services;
using Xunit;

namespace API.Tests.Services
{
    public class AuthServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _context = TestDbHelper.CreateInMemoryContext();
            _mockJwtService = new Mock<IJwtService>();
            _authService = new AuthService(_context, _mockJwtService.Object);
            
            // Configurar mock padrão
            _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<Usuario>()))
                          .Returns("fake-jwt-token");
            _mockJwtService.Setup(x => x.GenerateRefreshToken())
                          .Returns("fake-refresh-token");
            _mockJwtService.Setup(x => x.CreateUserInfo(It.IsAny<Usuario>()))
                          .Returns((Usuario u) => new UserInfo
                          {
                              Id = u.Id,
                              Nome = u.Nome,
                              Email = u.Email,
                              Tipo = u.Tipo
                          });
        }

        #region LoginAsync Tests

        [Fact]
        public async Task LoginAsync_ValidCredentials_ShouldReturnSuccess()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);
            var request = new LoginRequest 
            { 
                Email = "joao@teste.com", 
                Senha = "123456" 
            };

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Success.Should().BeTrue();
            result.Token.Should().Be("fake-jwt-token");
            result.RefreshToken.Should().Be("fake-refresh-token");
            result.Message.Should().Be("Login realizado com sucesso");
        }

        [Fact]
        public async Task LoginAsync_RootUser_ShouldReturnSuccess()
        {
            // Arrange
            var request = new LoginRequest 
            { 
                Email = "root", 
                Senha = "1234" 
            };

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Login root realizado com sucesso");
            result.User.Nome.Should().Be("Administrador Root");
        }

        [Fact]
        public async Task LoginAsync_InvalidEmail_ShouldReturnFailure()
        {
            // Arrange
            var request = new LoginRequest 
            { 
                Email = "naoexiste@teste.com", 
                Senha = "123456" 
            };

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Email ou senha inválidos");
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ShouldReturnFailure()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);
            var request = new LoginRequest 
            { 
                Email = "joao@teste.com", 
                Senha = "senhaerrada" 
            };

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Email ou senha inválidos");
        }

        #endregion

        #region RegisterAsync Tests

        [Fact]
        public async Task RegisterAsync_ValidData_ShouldReturnSuccess()
        {
            // Arrange
            var request = new RegisterRequest
            {
                Nome = "Novo Usuario",
                Email = "novo@teste.com",
                Senha = "123456",
                Tipo = TipoUsuario.Aluno
            };

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.Success.Should().BeTrue();
            result.Message.Should().Be("Usuário registrado com sucesso");
            
            // Verificar se foi salvo no banco
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == "novo@teste.com");
            usuario.Should().NotBeNull();
        }

        [Fact]
        public async Task RegisterAsync_DuplicateEmail_ShouldReturnFailure()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);
            var request = new RegisterRequest
            {
                Nome = "Outro Usuario",
                Email = "joao@teste.com", // Email já existe
                Senha = "123456",
                Tipo = TipoUsuario.Aluno
            };

            // Act
            var result = await _authService.RegisterAsync(request);

            // Assert
            result.Success.Should().BeFalse();
            result.Message.Should().Be("Email já está em uso");
        }

        #endregion

        #region GetUserByEmailAsync Tests

        [Fact]
        public async Task GetUserByEmailAsync_ExistingUser_ShouldReturnUser()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);

            // Act
            var result = await _authService.GetUserByEmailAsync("joao@teste.com");

            // Assert
            result.Should().NotBeNull();
            result!.Nome.Should().Be("João Aluno");
        }

        [Fact]
        public async Task GetUserByEmailAsync_RootUser_ShouldReturnRootUser()
        {
            // Act
            var result = await _authService.GetUserByEmailAsync("root");

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(-1);
            result.Nome.Should().Be("Administrador Root");
        }

        [Fact]
        public async Task GetUserByEmailAsync_NonExistingUser_ShouldReturnNull()
        {
            // Act
            var result = await _authService.GetUserByEmailAsync("naoexiste@teste.com");

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region ValidateUserAsync Tests

        [Fact]
        public async Task ValidateUserAsync_ValidCredentials_ShouldReturnTrue()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);

            // Act
            var result = await _authService.ValidateUserAsync("joao@teste.com", "123456");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task ValidateUserAsync_RootCredentials_ShouldReturnTrue()
        {
            // Act
            var result = await _authService.ValidateUserAsync("root", "1234");

            // Assert
            result.Should().BeTrue();
        }

        [Fact]
        public async Task ValidateUserAsync_InvalidCredentials_ShouldReturnFalse()
        {
            // Arrange
            TestDbHelper.SeedTestData(_context);

            // Act
            var result = await _authService.ValidateUserAsync("joao@teste.com", "senhaerrada");

            // Assert
            result.Should().BeFalse();
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
} 