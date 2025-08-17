using Microsoft.AspNetCore.Mvc;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.Security.Claims;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IJwtService _jwtService;

        public AuthController(IAuthService authService, IJwtService jwtService)
        {
            _authService = authService;
            _jwtService = jwtService;
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