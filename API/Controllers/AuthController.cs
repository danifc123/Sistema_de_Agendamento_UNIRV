using Microsoft.AspNetCore.Mvc;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;

        public AuthController(IAuthService authService, IJwtService jwtService, IEmailService emailService)
        {
            _authService = authService;
            _jwtService = jwtService;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.LoginAsync(request);

            if (!response.Success)
            {
                return Unauthorized(response);
            }

            return Ok(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _authService.RegisterAsync(request);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            // Implementar lógica de refresh token se necessário
            return BadRequest(new { message = "Refresh token não implementado ainda" });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

                        // Sempre retornar 200 para evitar enumeração de usuários
            var usuario = await _authService.GetUserByEmailAsync(request.Email);
            if (usuario != null)
            {
                Console.WriteLine($"[FORGOT-PASSWORD] Usuário encontrado para e-mail: {usuario.Email}");
                var token = _jwtService.GeneratePasswordResetToken(usuario.Email);
                var resetLink = $"https://frontend-production-25f9.up.railway.app/auth/resetpassword?token={Uri.EscapeDataString(token)}";
                Console.WriteLine($"[FORGOT-PASSWORD] Reset link gerado: {resetLink}");

                try
                {
                    await _emailService.SendAsync(usuario.Email, "Redefinição de senha", $"<p>Para redefinir sua senha, clique no link abaixo:</p><p><a href='{resetLink}'>Redefinir senha</a></p><p>Se você não solicitou, ignore este e-mail.</p>");
                    Console.WriteLine("[FORGOT-PASSWORD] E-mail de redefinição enviado (provider configurado).");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[FORGOT-PASSWORD][ERROR] Falha ao enviar e-mail: {ex.Message}");
                    // Não revelar detalhes ao cliente; seguimos com 200 OK
                }
            }
            else
            {
                Console.WriteLine($"[FORGOT-PASSWORD] Nenhum usuário encontrado para e-mail informado (fluxo segue com 200)");
            }

            return Ok(new { message = "Se o e-mail existir, enviaremos instruções para redefinir a senha." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            Console.WriteLine($"[RESET-PASSWORD] Iniciando processo de reset de senha");
            Console.WriteLine($"[RESET-PASSWORD] Token recebido: {request.Token.Substring(0, Math.Min(50, request.Token.Length))}...");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine($"[RESET-PASSWORD] ModelState inválido");
                foreach (var error in ModelState)
                {
                    Console.WriteLine($"[RESET-PASSWORD] Erro no campo {error.Key}: {string.Join(", ", error.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }

            var principal = _jwtService.ValidatePasswordResetToken(request.Token);
            if (principal == null)
            {
                Console.WriteLine($"[RESET-PASSWORD] Token inválido ou expirado");
                return BadRequest(new { message = "Token inválido ou expirado." });
            }

            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            Console.WriteLine($"[RESET-PASSWORD] Email extraído do token: {email}");
            
            if (string.IsNullOrWhiteSpace(email))
            {
                Console.WriteLine($"[RESET-PASSWORD] Email não encontrado no token");
                return BadRequest(new { message = "Token inválido." });
            }

            var usuario = await _authService.GetUserByEmailAsync(email);
            if (usuario == null)
            {
                Console.WriteLine($"[RESET-PASSWORD] Usuário não encontrado para email: {email}");
                return BadRequest(new { message = "Usuário não encontrado." });
            }

            Console.WriteLine($"[RESET-PASSWORD] Atualizando senha para usuário: {usuario.Email}");
            
            // Atualizar senha
            usuario.Senha = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
            await HttpContext.RequestServices.GetRequiredService<SeuProjeto.Data.AppDbContext>().SaveChangesAsync();

            Console.WriteLine($"[RESET-PASSWORD] Senha atualizada com sucesso para: {usuario.Email}");
            return Ok(new { message = "Senha atualizada com sucesso." });
        }

        // ENDPOINT TEMPORÁRIO PARA DEBUG - REMOVER EM PRODUÇÃO
        [HttpPost("debug-generate-reset-token")]
        [AllowAnonymous]
        public async Task<IActionResult> DebugGenerateResetToken([FromBody] ForgotPasswordRequest request)
        {
            Console.WriteLine($"[DEBUG] Solicitação de token para: {request.Email}");
            var usuario = await _authService.GetUserByEmailAsync(request.Email);
            if (usuario != null)
            {
                var token = _jwtService.GeneratePasswordResetToken(usuario.Email);
                var resetLink = $"https://frontend-production-25f9.up.railway.app/auth/resetpassword?token={Uri.EscapeDataString(token)}";
                Console.WriteLine($"[DEBUG] Token gerado para {usuario.Email}");
                Console.WriteLine($"[DEBUG] Link completo: {resetLink}");
                Console.WriteLine($"[DEBUG] Token puro: {token}");
                return Ok(new { 
                    token = token, 
                    email = usuario.Email, 
                    resetLink = resetLink,
                    message = "Token gerado com sucesso - use o resetLink ou copie o token" 
                });
            }
            Console.WriteLine($"[DEBUG] Usuário não encontrado para: {request.Email}");
            return BadRequest(new { message = "Usuário não encontrado" });
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserInfo>> GetCurrentUser()
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized(new { message = "Token não fornecido" });
            }

            var principal = _jwtService.ValidateToken(token);
            if (principal == null)
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            var userIdClaim = principal.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Token inválido" });
            }

            // Se for o usuário root (ID = -1), retornar informações do root
            if (userId == -1)
            {
                var userInfo = new UserInfo
                {
                    Id = userId,
                    Nome = "Administrador Root",
                    Email = "root@system",
                    Tipo = TipoUsuario.Admin
                };

                return Ok(userInfo);
            }

            // Para outros usuários, buscar informações atualizadas do banco
            var email = principal.FindFirst(ClaimTypes.Email)?.Value;
            if (!string.IsNullOrEmpty(email))
            {
                var usuario = await _authService.GetUserByEmailAsync(email);
                if (usuario != null)
                {
                    return Ok(_jwtService.CreateUserInfo(usuario));
                }
            }

            // Fallback: retornar informações do token
            var fallbackUserInfo = new UserInfo
            {
                Id = userId,
                Nome = principal.FindFirst(ClaimTypes.Name)?.Value ?? "",
                Email = principal.FindFirst(ClaimTypes.Email)?.Value ?? "",
                Tipo = Enum.Parse<TipoUsuario>(principal.FindFirst(ClaimTypes.Role)?.Value ?? "Aluno")
            };

            return Ok(fallbackUserInfo);
        }
    }
} 