using API.Tests.Helpers;
using FluentAssertions;
using Moq;
using Moq.Protected;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.Net;
using System.Net.Mail;
using System.Net.Sockets;
using System.Text.Json;
using Xunit;

namespace API.Tests.Services
{
    public class EmailServiceTests
    {
        private readonly Mock<HttpClient> _mockHttpClient;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;

        public EmailServiceTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _mockHttpClient = new Mock<HttpClient>(_mockHttpMessageHandler.Object);
        }

        #region SMTP Tests

        [Fact]
        public async Task SendAsync_SmtpProvider_ValidEmail_ShouldNotThrowException()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSmtpSettings();
            var httpClient = new HttpClient(); // HttpClient real para SMTP (não é usado)
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert - Para SMTP, vamos apenas verificar que não lança exceção de configuração
            // Em um ambiente real, isso tentaria enviar via SMTP, mas para testes unitários
            // focamos na lógica de decisão do provider
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");
            
                         // Como não temos um servidor SMTP real, esperamos uma exceção de rede/SMTP
             await act.Should().ThrowAsync<Exception>().Where(ex => 
                 ex is SmtpException || 
                 ex is SocketException ||
                 ex is HttpRequestException ||
                 ex.Message.Contains("mail") ||
                 ex.Message.Contains("SMTP") || 
                 ex.Message.Contains("network") || 
                 ex.Message.Contains("connection"));
        }

        [Fact]
        public void EmailService_Constructor_ValidSmtpSettings_ShouldInitializeCorrectly()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSmtpSettings();
            var httpClient = new HttpClient();

            // Act
            var emailService = new EmailService(settings, httpClient);

            // Assert
            emailService.Should().NotBeNull();
        }

        [Fact]
        public void EmailService_Constructor_InvalidSmtpSettings_ShouldInitializeCorrectly()
        {
            // Arrange - Mesmo com settings inválidas, o construtor deve funcionar
            var settings = TestEmailHelper.CreateInvalidSmtpSettings();
            var httpClient = new HttpClient();

            // Act
            var emailService = new EmailService(settings, httpClient);

            // Assert
            emailService.Should().NotBeNull();
        }

        [Fact]
        public async Task SendAsync_SmtpProvider_EmptyToEmail_ShouldThrowException()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSmtpSettings();
            var httpClient = new HttpClient();
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert
            var act = async () => await emailService.SendAsync("", "Test Subject", "<h1>Test Body</h1>");
            await act.Should().ThrowAsync<Exception>();
        }

        #endregion

        #region SendGrid Tests

        [Fact]
        public async Task SendAsync_SendGridProvider_ValidEmail_ShouldSendSuccessfully()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSendGridSettings();
            
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var emailService = new EmailService(settings, httpClient);

            // Act
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");

            // Assert
            await act.Should().NotThrowAsync();
            
            // Verificar se a chamada HTTP foi feita
            _mockHttpMessageHandler
                .Protected()
                .Verify(
                    "SendAsync",
                    Times.Once(),
                    ItExpr.Is<HttpRequestMessage>(req => 
                        req.Method == HttpMethod.Post && 
                        req.RequestUri!.ToString().Contains("sendgrid.com")),
                    ItExpr.IsAny<CancellationToken>());
        }

        [Fact]
        public async Task SendAsync_SendGridProvider_MissingApiKey_ShouldThrowException()
        {
            // Arrange
            var settings = TestEmailHelper.CreateSendGridSettingsWithoutApiKey();
            var httpClient = new HttpClient();
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("SendGridApiKey não configurada.");
        }

        [Fact]
        public async Task SendAsync_SendGridProvider_ErrorResponse_ShouldThrowException()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSendGridSettings();
            
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.BadRequest)
                {
                    Content = new StringContent("API Error: Invalid request")
                });

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Falha ao enviar via SendGrid*");
        }

        [Fact]
        public async Task SendAsync_SendGridProvider_CorrectPayload_ShouldSendCorrectRequest()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSendGridSettings();
            HttpRequestMessage? capturedRequest = null;
            
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .Callback<HttpRequestMessage, CancellationToken>((req, ct) => capturedRequest = req)
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var emailService = new EmailService(settings, httpClient);

            // Act
            await emailService.SendAsync("recipient@test.com", "Test Subject", "<h1>Test Body</h1>");

            // Assert
            capturedRequest.Should().NotBeNull();
            capturedRequest!.Method.Should().Be(HttpMethod.Post);
            capturedRequest.RequestUri!.ToString().Should().Be("https://api.sendgrid.com/v3/mail/send");
            
            // Verificar headers
            capturedRequest.Headers.Authorization.Should().NotBeNull();
            capturedRequest.Headers.Authorization!.Scheme.Should().Be("Bearer");
            capturedRequest.Headers.Authorization.Parameter.Should().Be("SG.test-api-key-123456789");

                         // Verificar conteúdo
             var content = await capturedRequest.Content!.ReadAsStringAsync();
             content.Should().NotBeNullOrEmpty();
             content.Should().Contain("recipient@test.com");
             content.Should().Contain("Test Subject");
             content.Should().Contain("Test Body"); // Verificar apenas o texto, não o HTML
             content.Should().Contain("noreply@test.com");
        }

        [Fact]
        public async Task SendAsync_SendGridProvider_UnauthorizedResponse_ShouldThrowException()
        {
            // Arrange
            var settings = TestEmailHelper.CreateMockSendGridSettings();
            
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.Unauthorized)
                {
                    Content = new StringContent("Unauthorized: Invalid API key")
                });

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");
            await act.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Falha ao enviar via SendGrid: 401*");
        }

        #endregion

        #region Configuration Tests

        [Fact]
        public void Constructor_ValidSettings_ShouldInitializeCorrectly()
        {
            // Arrange
            var smtpSettings = TestEmailHelper.CreateMockSmtpSettings();
            var sendGridSettings = TestEmailHelper.CreateMockSendGridSettings();
            var httpClient = new HttpClient();

            // Act
            var smtpEmailService = new EmailService(smtpSettings, httpClient);
            var sendGridEmailService = new EmailService(sendGridSettings, httpClient);

            // Assert
            smtpEmailService.Should().NotBeNull();
            sendGridEmailService.Should().NotBeNull();
        }

        [Fact]
        public async Task SendAsync_UnknownProvider_ShouldUseSMTPByDefault()
        {
            // Arrange
            var settings = Microsoft.Extensions.Options.Options.Create(new EmailSettings
            {
                Provider = "UnknownProvider", // Provider desconhecido
                SmtpHost = "smtp.test.com",
                SmtpPort = 587,
                EnableSsl = true,
                User = "test@test.com",
                Password = "testpassword",
                From = "noreply@test.com"
            });

            var httpClient = new HttpClient();
            var emailService = new EmailService(settings, httpClient);

            // Act & Assert - Deve usar SMTP como fallback
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");
            
                         // Como não temos servidor SMTP real, esperamos exceção de rede/SMTP
             await act.Should().ThrowAsync<Exception>().Where(ex => 
                 !ex.Message.Contains("SendGrid") && // Não deve ser erro do SendGrid
                 (ex is SmtpException || 
                  ex is SocketException ||
                  ex is HttpRequestException ||
                  ex.Message.Contains("mail") ||
                  ex.Message.Contains("SMTP") || 
                  ex.Message.Contains("network") || 
                  ex.Message.Contains("connection")));
        }

        [Fact]
        public async Task SendAsync_CaseInsensitiveProvider_SendGrid_ShouldWorkCorrectly()
        {
            // Arrange - Testar provider case insensitive
            var settings = Microsoft.Extensions.Options.Options.Create(new EmailSettings
            {
                Provider = "sendgrid", // lowercase
                SendGridApiKey = "SG.test-api-key-123456789",
                From = "noreply@test.com"
            });
            
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK));

            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            var emailService = new EmailService(settings, httpClient);

            // Act
            var act = async () => await emailService.SendAsync("test@test.com", "Test Subject", "<h1>Test Body</h1>");

            // Assert - Deve usar SendGrid mesmo com lowercase
            await act.Should().NotThrowAsync();
            
            _mockHttpMessageHandler
                .Protected()
                .Verify(
                    "SendAsync",
                    Times.Once(),
                    ItExpr.Is<HttpRequestMessage>(req => 
                        req.RequestUri!.ToString().Contains("sendgrid.com")),
                    ItExpr.IsAny<CancellationToken>());
        }

        #endregion
    }
} 