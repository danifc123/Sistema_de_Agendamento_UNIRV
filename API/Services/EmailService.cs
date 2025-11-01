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
            Console.WriteLine($"[EMAIL] Tentando enviar email para: {to}");
            Console.WriteLine($"[EMAIL] Provider configurado: {_settings.Provider}");
            Console.WriteLine($"[EMAIL] From: {_settings.From}");
            
            if (string.Equals(_settings.Provider, "SendGrid", StringComparison.OrdinalIgnoreCase))
            {
                Console.WriteLine("[EMAIL] Usando SendGrid");
                await SendViaSendGridAsync(to, subject, htmlBody);
                Console.WriteLine("[EMAIL] ✅ Email enviado via SendGrid com sucesso");
                return;
            }

            Console.WriteLine($"[EMAIL] Usando SMTP: {_settings.SmtpHost}:{_settings.SmtpPort}");
            Console.WriteLine($"[EMAIL] SSL: {_settings.EnableSsl}, User: {_settings.User}");
            
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
            Console.WriteLine("[EMAIL] ✅ Email enviado via SMTP com sucesso");
        }

        private async Task SendViaSendGridAsync(string to, string subject, string htmlBody)
        {
            if (string.IsNullOrWhiteSpace(_settings.SendGridApiKey))
            {
                Console.WriteLine("[EMAIL][ERRO] SendGridApiKey não configurada!");
                Console.WriteLine("[EMAIL][DICA] Adicione a variável de ambiente: Email__SendGridApiKey");
                throw new InvalidOperationException("SendGridApiKey não configurada. Adicione a variável de ambiente Email__SendGridApiKey");
            }

            Console.WriteLine($"[EMAIL] SendGrid API Key presente: {_settings.SendGridApiKey.Substring(0, Math.Min(10, _settings.SendGridApiKey.Length))}...");
            
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

            Console.WriteLine("[EMAIL] Enviando requisição para SendGrid...");
            var response = await _httpClient.SendAsync(request);
            
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[EMAIL][ERRO] SendGrid retornou erro: {(int)response.StatusCode}");
                Console.WriteLine($"[EMAIL][ERRO] Resposta: {body}");
                throw new InvalidOperationException($"Falha ao enviar via SendGrid: {(int)response.StatusCode} - {body}");
            }
            
            Console.WriteLine($"[EMAIL] SendGrid respondeu com sucesso: {(int)response.StatusCode}");
        }
    }
} 