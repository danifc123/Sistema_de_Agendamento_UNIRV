using Microsoft.Extensions.Options;
using SeuProjeto.Models;
using System.Net;
using System.Net.Mail;
using System.Net.Http.Headers;
using System.Text.Json;

namespace SeuProjeto.Services
{
    public interface IEmailService
    {
        Task SendAsync(string to, string subject, string htmlBody);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly HttpClient _httpClient;

        public EmailService(IOptions<EmailSettings> settings, HttpClient httpClient)
        {
            _settings = settings.Value;
            _httpClient = httpClient;
        }

        public async Task SendAsync(string to, string subject, string htmlBody)
        {
            if (string.Equals(_settings.Provider, "SendGrid", StringComparison.OrdinalIgnoreCase))
            {
                await SendViaSendGridAsync(to, subject, htmlBody);
                return;
            }

            using var message = new MailMessage();
            message.From = new MailAddress(_settings.From);
            message.To.Add(new MailAddress(to));
            message.Subject = subject;
            message.Body = htmlBody;
            message.IsBodyHtml = true;

            using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
            {
                EnableSsl = _settings.EnableSsl,
                Credentials = new NetworkCredential(_settings.User, _settings.Password)
            };

            await client.SendMailAsync(message);
        }

        private async Task SendViaSendGridAsync(string to, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(_settings.SendGridApiKey))
            {
                throw new InvalidOperationException("SendGridApiKey não configurada.");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.SendGridApiKey);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var payload = new
            {
                personalizations = new[]
                {
                    new { to = new[] { new { email = to } } }
                },
                from = new { email = _settings.From },
                subject = subject,
                content = new[]
                {
                    new { type = "text/html", value = htmlBody }
                }
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload));
            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"Falha ao enviar via SendGrid: {(int)response.StatusCode} - {body}");
            }
        }
    }
} 