using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;
using BCrypt.Net;

namespace SeuProjeto.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<Usuario?> GetUserByEmailAsync(string email);
        Task<bool> ValidateUserAsync(string email, string senha);
    }

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthService(AppDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                // Verificar se é o usuário root
                if (IsRootUser(request.Email, request.Senha))
                {
                    Console.WriteLine("Login root realizado com sucesso");
                    var rootUser = CreateRootUser();
                    var rootToken = _jwtService.GenerateToken(rootUser);
                    var rootRefreshToken = _jwtService.GenerateRefreshToken();

                    return new AuthResponse
                    {
                        Success = true,
                        Token = rootToken,
                        RefreshToken = rootRefreshToken,
                        ExpiresAt = DateTime.UtcNow.AddHours(24),
                        User = _jwtService.CreateUserInfo(rootUser),
                        Message = "Login root realizado com sucesso"
                    };
                }

                // Buscar usuário por email
                var usuario = await _context.Usuarios
                    .Include(u => u.Aluno)
                    .Include(u => u.Psicologo)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

                if (usuario == null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Email ou senha inválidos"
                    };
                }

                // Verificar senha
                if (!BCrypt.Net.BCrypt.Verify(request.Senha, usuario.Senha))
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Email ou senha inválidos"
                    };
                }

                // Gerar token
                var token = _jwtService.GenerateToken(usuario);
                var refreshToken = _jwtService.GenerateRefreshToken();

                return new AuthResponse
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(24),
                    User = _jwtService.CreateUserInfo(usuario),
                    Message = "Login realizado com sucesso"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Erro interno: " + ex);
                return new AuthResponse
                {
                    Success = false,
                    Message = $"Erro interno: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Verificar se email já existe
                var existingUser = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());

                if (existingUser != null)
                {
                    return new AuthResponse
                    {
                        Success = false,
                        Message = "Email já está em uso"
                    };
                }

                // Criar novo usuário
                var usuario = new Usuario
                {
                    Nome = request.Nome,
                    Email = request.Email,
                    Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha),
                    Tipo = request.Tipo
                };

                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                // Gerar token
                var token = _jwtService.GenerateToken(usuario);
                var refreshToken = _jwtService.GenerateRefreshToken();

                return new AuthResponse
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddHours(24),
                    User = _jwtService.CreateUserInfo(usuario),
                    Message = "Usuário registrado com sucesso"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = $"Erro interno: {ex.Message}"
                };
            }
        }

        public async Task<Usuario?> GetUserByEmailAsync(string email)
        {
            // Se for root, retornar o usuário root criado
            if (email.Equals("root", StringComparison.OrdinalIgnoreCase))
            {
                return CreateRootUser();
            }

            return await _context.Usuarios
                .Include(u => u.Aluno)
                .Include(u => u.Psicologo)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
        }

        public async Task<bool> ValidateUserAsync(string email, string senha)
        {
            // Verificar se é o usuário root
            if (IsRootUser(email, senha))
            {
                return true;
            }

            var usuario = await GetUserByEmailAsync(email);
            if (usuario == null) return false;

            return BCrypt.Net.BCrypt.Verify(senha, usuario.Senha);
        }

        /// <summary>
        /// Verifica se as credenciais correspondem ao usuário root hardcoded
        /// </summary>
        /// <param name="email">Email do usuário (aceita "root" em maiúsculo ou minúsculo)</param>
        /// <param name="senha">Senha do usuário (deve ser "1234")</param>
        /// <returns>True se for o usuário root, false caso contrário</returns>
        private bool IsRootUser(string email, string senha)
        {
            // Verificar se o email é "root" (case insensitive) e senha é "1234"
            return email.Equals("root", StringComparison.OrdinalIgnoreCase) && 
                   senha == "1234";
        }

        /// <summary>
        /// Cria o usuário root hardcoded
        /// </summary>
        /// <returns>Usuário root com ID -1 (não existe no banco)</returns>
        private Usuario CreateRootUser()
        {
            return new Usuario
            {
                Id = -1, // ID especial para root (não existe no banco)
                Nome = "Administrador Root",
                Email = "root@system",
                Senha = "root_password_hash", // Não será usado para verificação
                Tipo = TipoUsuario.Admin
            };
        }
    }
} 