using API.Tests.Helpers;
using FluentAssertions;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Xunit;

namespace API.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;
        private readonly Usuario _testUser;

        public JwtServiceTests()
        {
            var jwtSettings = TestJwtHelper.CreateMockJwtSettings();
            _jwtService = new JwtService(jwtSettings);
            
            // Usuário de teste padrão
            _testUser = new Usuario
            {
                Id = 1,
                Nome = "João Teste",
                Email = "joao@teste.com",
                Tipo = TipoUsuario.Aluno,
                                 Aluno = new Aluno
                 {
                     Id = 1,
                     Matricula = "2024001",
                     Curso = "Psicologia"
                 }
            };
        }

        #region GenerateToken Tests

        [Fact]
        public void GenerateToken_ValidUser_ShouldReturnValidToken()
        {
            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            token.Should().NotBeNullOrEmpty();
            token.Should().Contain("."); // JWT deve ter pontos separadores
            
            // Verificar se é um JWT válido
            var handler = new JwtSecurityTokenHandler();
            var canReadToken = handler.CanReadToken(token);
            canReadToken.Should().BeTrue();
        }

        [Fact]
        public void GenerateToken_UserWithClaims_ShouldIncludeCorrectClaims()
        {
            // Act
            var token = _jwtService.GenerateToken(_testUser);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadJwtToken(token);
            
                         // Verificar claims essenciais (usar os tipos que realmente aparecem no JWT)
             jsonToken.Claims.Should().Contain(c => c.Type == "nameid" && c.Value == "1");
             jsonToken.Claims.Should().Contain(c => c.Type == "unique_name" && c.Value == "João Teste");
             jsonToken.Claims.Should().Contain(c => c.Type == "email" && c.Value == "joao@teste.com");
             jsonToken.Claims.Should().Contain(c => c.Type == "role" && c.Value == "Aluno");
             jsonToken.Claims.Should().Contain(c => c.Type == "userId" && c.Value == "1");
        }

        [Fact]
        public void GenerateToken_DifferentUsers_ShouldReturnDifferentTokens()
        {
            // Arrange
            var user2 = new Usuario
            {
                Id = 2,
                Nome = "Maria Teste",
                Email = "maria@teste.com",
                Tipo = TipoUsuario.Psicologo
            };

            // Act
            var token1 = _jwtService.GenerateToken(_testUser);
            var token2 = _jwtService.GenerateToken(user2);

            // Assert
            token1.Should().NotBe(token2);
        }

        #endregion

        #region ValidateToken Tests

        [Fact]
        public void ValidateToken_ValidToken_ShouldReturnClaimsPrincipal()
        {
            // Arrange
            var token = _jwtService.GenerateToken(_testUser);

            // Act
            var principal = _jwtService.ValidateToken(token);

            // Assert
            principal.Should().NotBeNull();
            principal!.FindFirst(ClaimTypes.NameIdentifier)?.Value.Should().Be("1");
            principal.FindFirst(ClaimTypes.Name)?.Value.Should().Be("João Teste");
            principal.FindFirst(ClaimTypes.Email)?.Value.Should().Be("joao@teste.com");
        }

        [Fact]
        public void ValidateToken_InvalidToken_ShouldReturnNull()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var principal = _jwtService.ValidateToken(invalidToken);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_MalformedToken_ShouldReturnNull()
        {
            // Arrange
            var malformedToken = "not-a-jwt-token";

            // Act
            var principal = _jwtService.ValidateToken(malformedToken);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidateToken_EmptyToken_ShouldReturnNull()
        {
            // Act
            var principal = _jwtService.ValidateToken("");

            // Assert
            principal.Should().BeNull();
        }

        #endregion

        #region RefreshToken Tests

        [Fact]
        public void GenerateRefreshToken_ShouldReturnUniqueToken()
        {
            // Act
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Assert
            refreshToken.Should().NotBeNullOrEmpty();
            refreshToken.Length.Should().BeGreaterThan(10); // Deve ter um tamanho razoável
        }

        [Fact]
        public void GenerateRefreshToken_MultipleCalls_ShouldReturnDifferentTokens()
        {
            // Act
            var token1 = _jwtService.GenerateRefreshToken();
            var token2 = _jwtService.GenerateRefreshToken();
            var token3 = _jwtService.GenerateRefreshToken();

            // Assert
            token1.Should().NotBe(token2);
            token2.Should().NotBe(token3);
            token1.Should().NotBe(token3);
        }

        #endregion

        #region PasswordResetToken Tests

        [Fact]
        public void GeneratePasswordResetToken_ValidEmail_ShouldReturnToken()
        {
            // Arrange
            var email = "teste@exemplo.com";

            // Act
            var token = _jwtService.GeneratePasswordResetToken(email);

            // Assert
            token.Should().NotBeNullOrEmpty();
            
            // Verificar se é um JWT válido
            var handler = new JwtSecurityTokenHandler();
            var canReadToken = handler.CanReadToken(token);
            canReadToken.Should().BeTrue();
            
                         // Verificar claims
             var jsonToken = handler.ReadJwtToken(token);
             jsonToken.Claims.Should().Contain(c => c.Type == "email" && c.Value == email);
             jsonToken.Claims.Should().Contain(c => c.Type == "purpose" && c.Value == "password_reset");
        }

        [Fact]
        public void ValidatePasswordResetToken_ValidToken_ShouldReturnClaims()
        {
            // Arrange
            var email = "teste@exemplo.com";
            var token = _jwtService.GeneratePasswordResetToken(email);

            // Act
            var principal = _jwtService.ValidatePasswordResetToken(token);

            // Assert
            principal.Should().NotBeNull();
            principal!.FindFirst(ClaimTypes.Email)?.Value.Should().Be(email);
            principal.FindFirst("purpose")?.Value.Should().Be("password_reset");
        }

        [Fact]
        public void ValidatePasswordResetToken_WrongPurpose_ShouldReturnNull()
        {
            // Arrange - Usar um token normal (não de reset de senha)
            var normalToken = _jwtService.GenerateToken(_testUser);

            // Act
            var principal = _jwtService.ValidatePasswordResetToken(normalToken);

            // Assert
            principal.Should().BeNull();
        }

        [Fact]
        public void ValidatePasswordResetToken_InvalidToken_ShouldReturnNull()
        {
            // Arrange
            var invalidToken = "invalid.token.here";

            // Act
            var principal = _jwtService.ValidatePasswordResetToken(invalidToken);

            // Assert
            principal.Should().BeNull();
        }

        #endregion

        #region CreateUserInfo Tests

        [Fact]
        public void CreateUserInfo_CompleteUser_ShouldMapAllProperties()
        {
            // Act
            var userInfo = _jwtService.CreateUserInfo(_testUser);

            // Assert
            userInfo.Should().NotBeNull();
            userInfo.Id.Should().Be(_testUser.Id);
            userInfo.Nome.Should().Be(_testUser.Nome);
            userInfo.Email.Should().Be(_testUser.Email);
            userInfo.Tipo.Should().Be(_testUser.Tipo);
            userInfo.Matricula.Should().Be(_testUser.Aluno?.Matricula);
            userInfo.Crp.Should().BeNull(); // Este usuário não é psicólogo
        }

        [Fact]
        public void CreateUserInfo_UserWithoutRelations_ShouldMapBasicProperties()
        {
            // Arrange
            var simpleUser = new Usuario
            {
                Id = 999,
                Nome = "Usuário Simples",
                Email = "simples@teste.com",
                Tipo = TipoUsuario.Admin
            };

            // Act
            var userInfo = _jwtService.CreateUserInfo(simpleUser);

            // Assert
            userInfo.Should().NotBeNull();
            userInfo.Id.Should().Be(999);
            userInfo.Nome.Should().Be("Usuário Simples");
            userInfo.Email.Should().Be("simples@teste.com");
            userInfo.Tipo.Should().Be(TipoUsuario.Admin);
            userInfo.Matricula.Should().BeNull();
            userInfo.Crp.Should().BeNull();
        }

        [Fact]
        public void CreateUserInfo_PsicologoUser_ShouldMapCrp()
        {
            // Arrange
            var psicologoUser = new Usuario
            {
                Id = 2,
                Nome = "Dr. João",
                Email = "dr.joao@teste.com",
                Tipo = TipoUsuario.Psicologo,
                                 Psicologo = new Psicologo
                 {
                     Id = 2,
                     Crp = "12345-SP",
                     Especialidade = "Clínica"
                 }
            };

            // Act
            var userInfo = _jwtService.CreateUserInfo(psicologoUser);

            // Assert
            userInfo.Should().NotBeNull();
            userInfo.Id.Should().Be(2);
            userInfo.Nome.Should().Be("Dr. João");
            userInfo.Crp.Should().Be("12345-SP");
            userInfo.Matricula.Should().BeNull(); // Este usuário não é aluno
        }

        #endregion
    }
} 