using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;
using SeuProjeto.Attributes;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsuariosController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

        // GET: api/usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // GET: api/usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);

            if (usuario == null)
            {
                return NotFound();
            }

            return usuario;
        }

        // POST: api/usuarios
        [HttpPost]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            // Normalizar email e hash da senha
            usuario.Email = usuario.Email?.Trim().ToLower();
            usuario.Senha = BCrypt.Net.BCrypt.HashPassword(usuario.Senha);

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, usuario);
        }

        // PUT: api/usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, [FromBody] object updateData)
        {
            
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }


            try
            {
                // Converter o objeto dinâmico para um dicionário
                var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                    System.Text.Json.JsonSerializer.Serialize(updateData));


                // Atualizar apenas os campos fornecidos
                if (data.ContainsKey("Nome"))
                {
                    usuario.Nome = data["Nome"].ToString();
                }
                if (data.ContainsKey("Email"))
                {
                    usuario.Email = data["Email"].ToString()?.Trim().ToLower();
                }
                if (data.ContainsKey("Senha"))
                {
                    var senhaNova = data["Senha"].ToString();
                    if (!string.IsNullOrWhiteSpace(senhaNova))
                    {
                        // Re-hash somente se um novo texto de senha for fornecido
                        usuario.Senha = BCrypt.Net.BCrypt.HashPassword(senhaNova);
                    }
                }
                if (data.ContainsKey("Tipo"))
                {
                    if (Enum.TryParse<TipoUsuario>(data["Tipo"].ToString(), out var tipo))
                    {
                        usuario.Tipo = tipo;
                    }
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao atualizar usuário: {ex.Message}");
            }
        }

        // DELETE: api/usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool UsuarioExists(int id)
        {
            return _context.Usuarios.Any(e => e.Id == id);
        }
    }
} 