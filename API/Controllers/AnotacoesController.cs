using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;
using System.Security.Claims;

using SeuProjeto.Attributes;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SeuProjeto.Attributes.Authorize]
    public class AnotacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnotacoesController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(idClaim, out var userId)) return userId;
            return null;
        }

        private bool IsAluno() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Aluno.ToString(), StringComparison.OrdinalIgnoreCase);
        private bool IsPsicologo() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Psicologo.ToString(), StringComparison.OrdinalIgnoreCase);
        private bool IsAdmin() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

        // GET: api/anotacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoes()
        {
            var query = _context.Anotacoes
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Include(a => a.Agendamento)
                .AsQueryable();

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue)
            {
                query = query.Where(a => a.AlunoId == userId.Value);
            }
            else if (IsPsicologo() && userId.HasValue)
            {
                query = query.Where(a => a.PsicologoId == userId.Value);
            }
            // Admin vê tudo

            return await query.ToListAsync();
        }

        // GET: api/anotacoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Anotacao>> GetAnotacao(int id)
        {
            var anotacao = await _context.Anotacoes
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Include(a => a.Agendamento)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (anotacao == null)
            {
                return NotFound();
            }

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && anotacao.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && anotacao.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            return anotacao;
        }

        // GET: api/anotacoes/aluno/5
        [HttpGet("aluno/{alunoId}")]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoesPorAluno(int alunoId)
        {
            var userId = GetCurrentUserId();
            if (IsAluno())
            {
                if (!userId.HasValue || alunoId != userId.Value) return Forbid();
            }

            var query = _context.Anotacoes
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Include(a => a.Agendamento)
                .Where(a => a.AlunoId == alunoId)
                .OrderByDescending(a => a.Data)
                .AsQueryable();

            if (IsPsicologo() && userId.HasValue)
            {
                query = query.Where(a => a.PsicologoId == userId.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/anotacoes/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoesPorPsicologo(int psicologoId)
        {
            var userId = GetCurrentUserId();
            if (IsPsicologo())
            {
                if (!userId.HasValue || psicologoId != userId.Value) return Forbid();
            }

            var query = _context.Anotacoes
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Agendamento)
                .Where(a => a.PsicologoId == psicologoId)
                .OrderByDescending(a => a.Data)
                .AsQueryable();

            if (IsAluno() && userId.HasValue)
            {
                query = query.Where(a => a.AlunoId == userId.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/anotacoes/data/{data}/{alunoId}/{psicologoId}
        [HttpGet("data/{data}/{alunoId}/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoesPorData(string data, int alunoId, int psicologoId)
        {
            if (!DateOnly.TryParse(data, out DateOnly dataAnotacao))
            {
                return BadRequest("Formato de data inválido. Use YYYY-MM-DD");
            }

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && alunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && psicologoId != userId.Value)
            {
                return Forbid();
            }

            return await _context.Anotacoes
                .Where(a => a.Data == dataAnotacao && 
                           a.AlunoId == alunoId && 
                           a.PsicologoId == psicologoId)
                .OrderByDescending(a => a.Id)
                .ToListAsync();
        }

        // POST: api/anotacoes
        [HttpPost]
        public async Task<ActionResult<Anotacao>> PostAnotacao(Anotacao anotacao)
        {
            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && anotacao.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && anotacao.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            _context.Anotacoes.Add(anotacao);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnotacao), new { id = anotacao.Id }, anotacao);
        }

        // PUT: api/anotacoes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAnotacao(int id, Anotacao anotacao)
        {
            if (id != anotacao.Id)
            {
                return BadRequest();
            }

            var existing = await _context.Anotacoes.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
            if (existing == null)
            {
                return NotFound();
            }

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && existing.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && existing.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            _context.Entry(anotacao).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnotacaoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/anotacoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnotacao(int id)
        {
            var anotacao = await _context.Anotacoes.FindAsync(id);
            if (anotacao == null)
            {
                return NotFound();
            }

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && anotacao.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && anotacao.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            _context.Anotacoes.Remove(anotacao);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AnotacaoExists(int id)
        {
            return _context.Anotacoes.Any(e => e.Id == id);
        }
    }
} 