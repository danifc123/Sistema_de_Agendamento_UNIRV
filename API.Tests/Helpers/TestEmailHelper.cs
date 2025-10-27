using Microsoft.Extensions.Options;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestEmailHelper
    {
        public static IOptions<EmailSettings> CreateMockSmtpSettings()
        {
            var emailSettings = new EmailSettings
            {
                Provider = "SMTP",
                SmtpHost = "smtp.test.com",
                SmtpPort = 587,
                EnableSsl = true,
                User = "test@test.com",
                Password = "testpassword",
                From = "noreply@test.com"
            };

            return Options.Create(emailSettings);
        }

        public static IOptions<EmailSettings> CreateMockSendGridSettings()
        {
            var emailSettings = new EmailSettings
            {
                Provider = "SendGrid",
                SendGridApiKey = "SG.test-api-key-123456789",
                From = "noreply@test.com"
            };

            return Options.Create(emailSettings);
        }

        public static IOptions<EmailSettings> CreateInvalidSmtpSettings()
        {
            var emailSettings = new EmailSettings
            {
                Provider = "SMTP",
                SmtpHost = "", // Host vazio
                SmtpPort = 0,  // Porta inválida
                EnableSsl = false,
                User = "",     // Usuário vazio
                Password = "", // Senha vazia
                From = ""      // From vazio
            };

            return Options.Create(emailSettings);
        }

        public static IOptions<EmailSettings> CreateSendGridSettingsWithoutApiKey()
        {
            var emailSettings = new EmailSettings
            {
                Provider = "SendGrid",
                SendGridApiKey = "", // API Key vazia
                From = "noreply@test.com"
            };

            return Options.Create(emailSettings);
        }
    }
} 