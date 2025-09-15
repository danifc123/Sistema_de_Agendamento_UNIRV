namespace SeuProjeto.Models
{
    public class EmailSettings
    {
        public string Provider { get; set; } = "SMTP"; // SMTP or SendGrid
        public string? SendGridApiKey { get; set; }
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public bool EnableSsl { get; set; }
        public string User { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string From { get; set; } = string.Empty;
    }
} 