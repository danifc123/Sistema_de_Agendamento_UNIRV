using System.ComponentModel.DataAnnotations;

namespace SeuProjeto.Models
{
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Senha { get; set; } = string.Empty;

        [Required]
        [Compare("Senha")]
        public string ConfirmarSenha { get; set; } = string.Empty;

        [Required]
        public TipoUsuario Tipo { get; set; }
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserInfo User { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public TipoUsuario Tipo { get; set; }
        public string? Matricula { get; set; }
        public string? Crp { get; set; }
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NovaSenha { get; set; } = string.Empty;

        [Required]
        [Compare("NovaSenha")]
        public string ConfirmarSenha { get; set; } = string.Empty;
    }
} 