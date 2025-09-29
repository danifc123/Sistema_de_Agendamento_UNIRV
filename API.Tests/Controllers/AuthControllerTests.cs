using API.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Moq;
using SeuProjeto.Controllers;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.Security.Claims;
using Xunit;

namespace API.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<IJwtService> _mockJwtService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockJwtService = new Mock<IJwtService>();
            _mockEmailService = new Mock<IEmailService>();
            _controller = new AuthController(_mockAuthService.Object, _mockJwtService.Object, _mockEmailService.Object);
        }

        #region POST /api/auth/login

        [Fact]
        public async Task Login_ValidCredentials_ShouldReturnOkWithToken()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Senha = "123456" };
            var authResponse = new AuthResponse
            {
                Success = true,
                Token = "valid-token",
                RefreshToken = "valid-refresh-token",
                Message = "Login realizado com sucesso"
            };

            _mockAuthService.Setup(x => x.LoginAsync(request)).ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = (AuthResponse)okResult.Value!;
            response.Success.Should().BeTrue();
            response.Token.Should().Be("valid-token");
        }

        [Fact]
        public async Task Login_InvalidCredentials_ShouldReturnUnauthorized()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Senha = "wrong" };
            var authResponse = new AuthResponse
            {
                Success = false,
                Message = "Email ou senha inválidos"
            };

            _mockAuthService.Setup(x => x.LoginAsync(request)).ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Login(request);

            // Assert
            var unauthorizedResult = result.Result.Should().BeOfType<UnauthorizedObjectResult>().Subject;
            var response = (AuthResponse)unauthorizedResult.Value!;
            response.Success.Should().BeFalse();
            response.Token.Should().BeNullOrEmpty();
        }

        [Fact]
        public async Task Login_InvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new LoginRequest { Email = "", Senha = "" };
            _controller.ModelState.AddModelError("Email", "Email é obrigatório");

            // Act
            var result = await _controller.Login(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/auth/register

        [Fact]
        public async Task Register_ValidData_ShouldReturnOkWithToken()
        {
            // Arrange
            var request = new RegisterRequest 
            { 
                Nome = "Novo Usuário",
                Email = "novo@test.com", 
                Senha = "123456",
                Tipo = TipoUsuario.Aluno
            };
            var authResponse = new AuthResponse
            {
                Success = true,
                Token = "valid-token",
                RefreshToken = "valid-refresh-token",
                Message = "Usuário registrado com sucesso"
            };

            _mockAuthService.Setup(x => x.RegisterAsync(request)).ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Register(request);

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var response = (AuthResponse)okResult.Value!;
            response.Success.Should().BeTrue();
            response.Token.Should().Be("valid-token");
        }

        [Fact]
        public async Task Register_DuplicateEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new RegisterRequest 
            { 
                Nome = "Usuário",
                Email = "existing@test.com", 
                Senha = "123456",
                Tipo = TipoUsuario.Aluno
            };
            var authResponse = new AuthResponse
            {
                Success = false,
                Message = "Email já está em uso"
            };

            _mockAuthService.Setup(x => x.RegisterAsync(request)).ReturnsAsync(authResponse);

            // Act
            var result = await _controller.Register(request);

            // Assert
            var badRequestResult = result.Result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var response = (AuthResponse)badRequestResult.Value!;
            response.Success.Should().BeFalse();
        }

        [Fact]
        public async Task Register_InvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new RegisterRequest();
            _controller.ModelState.AddModelError("Email", "Email é obrigatório");

            // Act
            var result = await _controller.Register(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/auth/refresh

        [Fact]
        public async Task RefreshToken_ShouldReturnNotImplemented()
        {
            // Arrange
            var request = new RefreshTokenRequest { RefreshToken = "some-token" };

            // Act
            var result = await _controller.RefreshToken(request);

            // Assert
            result.Result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/auth/forgot-password

        [Fact]
        public async Task ForgotPassword_ExistingUser_ShouldReturnOkAndSendEmail()
        {
            // Arrange
            var request = new ForgotPasswordRequest { Email = "existing@test.com" };
            var usuario = new Usuario { Email = "existing@test.com", Nome = "Test User" };

            _mockAuthService.Setup(x => x.GetUserByEmailAsync(It.IsAny<string>())).ReturnsAsync(usuario);
            _mockJwtService.Setup(x => x.GeneratePasswordResetToken(It.IsAny<string>(), It.IsAny<int>())).Returns("reset-token");
            _mockEmailService.Setup(x => x.SendAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                           .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            // Verificar se o email foi enviado
            _mockEmailService.Verify(x => x.SendAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>()), Times.Once);
        }

        [Fact]
        public async Task ForgotPassword_NonExistingUser_ShouldReturnOkWithoutSendingEmail()
        {
            // Arrange
            var request = new ForgotPasswordRequest { Email = "nonexisting@test.com" };

            _mockAuthService.Setup(x => x.GetUserByEmailAsync(request.Email)).ReturnsAsync((Usuario?)null);

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
            
            // Verificar que o email NÃO foi enviado
            _mockEmailService.Verify(x => x.SendAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task ForgotPassword_InvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new ForgotPasswordRequest { Email = "" };
            _controller.ModelState.AddModelError("Email", "Email é obrigatório");

            // Act
            var result = await _controller.ForgotPassword(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/auth/reset-password

        [Fact]
        public async Task ResetPassword_ValidToken_ShouldReturnOkAndUpdatePassword()
        {
            // Arrange
            var request = new ResetPasswordRequest 
            { 
                Token = "valid-reset-token", 
                NovaSenha = "newpassword123" 
            };
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Email, "test@test.com")
            }));
            var usuario = new Usuario { Email = "test@test.com", Nome = "Test User" };

            _mockJwtService.Setup(x => x.ValidatePasswordResetToken(request.Token)).Returns(claims);
            _mockAuthService.Setup(x => x.GetUserByEmailAsync("test@test.com")).ReturnsAsync(usuario);

            // Configurar DbContext mock via HttpContext
            var httpContext = new DefaultHttpContext();
            var serviceProvider = new Mock<IServiceProvider>();
            var dbContext = TestDbHelper.CreateInMemoryContext();
            serviceProvider.Setup(x => x.GetService(typeof(SeuProjeto.Data.AppDbContext))).Returns(dbContext);
            httpContext.RequestServices = serviceProvider.Object;
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async Task ResetPassword_InvalidToken_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new ResetPasswordRequest 
            { 
                Token = "invalid-token", 
                NovaSenha = "newpassword123" 
            };

            _mockJwtService.Setup(x => x.ValidatePasswordResetToken(request.Token)).Returns((ClaimsPrincipal?)null);

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            var response = badRequestResult.Value;
        }

        [Fact]
        public async Task ResetPassword_InvalidModelState_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new ResetPasswordRequest { Token = "", NovaSenha = "" };
            _controller.ModelState.AddModelError("Token", "Token é obrigatório");

            // Act
            var result = await _controller.ResetPassword(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region POST /api/auth/debug-generate-reset-token

        [Fact]
        public async Task DebugGenerateResetToken_ExistingUser_ShouldReturnTokenInfo()
        {
            // Arrange
            var request = new ForgotPasswordRequest { Email = "test@test.com" };
            var usuario = new Usuario { Email = "test@test.com", Nome = "Test User" };

            _mockAuthService.Setup(x => x.GetUserByEmailAsync(It.IsAny<string>())).ReturnsAsync(usuario);
            _mockJwtService.Setup(x => x.GeneratePasswordResetToken(It.IsAny<string>(), It.IsAny<int>())).Returns("debug-token");

            // Act
            var result = await _controller.DebugGenerateResetToken(request);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value;
        }

        [Fact]
        public async Task DebugGenerateResetToken_NonExistingUser_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new ForgotPasswordRequest { Email = "nonexisting@test.com" };

            _mockAuthService.Setup(x => x.GetUserByEmailAsync(request.Email)).ReturnsAsync((Usuario?)null);

            // Act
            var result = await _controller.DebugGenerateResetToken(request);

            // Assert
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        #endregion

        #region GET /api/auth/me

        [Fact]
        public async Task GetCurrentUser_ValidToken_ShouldReturnUserInfo()
        {
            // Arrange
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("userId", "1"),
                new Claim(ClaimTypes.Email, "test@test.com"),
                new Claim(ClaimTypes.Name, "Test User"),
                new Claim(ClaimTypes.Role, "Aluno")
            }));
            var usuario = new Usuario { Id = 1, Email = "test@test.com", Nome = "Test User", Tipo = TipoUsuario.Aluno };
            var userInfo = new UserInfo { Id = 1, Nome = "Test User", Email = "test@test.com", Tipo = TipoUsuario.Aluno };

            _mockJwtService.Setup(x => x.ValidateToken("valid-token")).Returns(claims);
            _mockAuthService.Setup(x => x.GetUserByEmailAsync("test@test.com")).ReturnsAsync(usuario);
            _mockJwtService.Setup(x => x.CreateUserInfo(usuario)).Returns(userInfo);

            // Configurar header Authorization
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer valid-token";
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedUserInfo = (UserInfo)okResult.Value!;
            returnedUserInfo.Id.Should().Be(1);
            returnedUserInfo.Email.Should().Be("test@test.com");
        }

        [Fact]
        public async Task GetCurrentUser_NoToken_ShouldReturnUnauthorized()
        {
            // Arrange
            var httpContext = new DefaultHttpContext();
            // Não definir header Authorization
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCurrentUser_InvalidToken_ShouldReturnUnauthorized()
        {
            // Arrange
            _mockJwtService.Setup(x => x.ValidateToken("invalid-token")).Returns((ClaimsPrincipal?)null);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer invalid-token";
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            result.Result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCurrentUser_RootUser_ShouldReturnRootInfo()
        {
            // Arrange
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("userId", "-1"),
                new Claim(ClaimTypes.Email, "root@system"),
                new Claim(ClaimTypes.Name, "Administrador Root"),
                new Claim(ClaimTypes.Role, "Admin")
            }));

            _mockJwtService.Setup(x => x.ValidateToken("root-token")).Returns(claims);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer root-token";
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var userInfo = (UserInfo)okResult.Value!;
            userInfo.Id.Should().Be(-1);
            userInfo.Nome.Should().Be("Administrador Root");
            userInfo.Email.Should().Be("root@system");
            userInfo.Tipo.Should().Be(TipoUsuario.Admin);
        }

        [Fact]
        public async Task GetCurrentUser_UserNotFoundInDb_ShouldReturnFallbackInfo()
        {
            // Arrange
            var claims = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("userId", "999"),
                new Claim(ClaimTypes.Email, "notfound@test.com"),
                new Claim(ClaimTypes.Name, "Not Found User"),
                new Claim(ClaimTypes.Role, "Aluno")
            }));

            _mockJwtService.Setup(x => x.ValidateToken("valid-token")).Returns(claims);
            _mockAuthService.Setup(x => x.GetUserByEmailAsync("notfound@test.com")).ReturnsAsync((Usuario?)null);

            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = "Bearer valid-token";
            _controller.ControllerContext = new ControllerContext { HttpContext = httpContext };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
            var userInfo = (UserInfo)okResult.Value!;
            userInfo.Id.Should().Be(999);
            userInfo.Nome.Should().Be("Not Found User");
            userInfo.Email.Should().Be("notfound@test.com");
        }

        #endregion
    }
} 