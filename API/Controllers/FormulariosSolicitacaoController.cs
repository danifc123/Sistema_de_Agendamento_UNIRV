using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;
using SeuProjeto.Attributes;
using System.Security.Claims;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SeuProjeto.Attributes.Authorize]
    public class FormulariosSolicitacaoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FormulariosSolicitacaoController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

        // GET: api/formulariossolicitacao
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormularioSolicitacao>>> GetFormulariosSolicitacao()
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            return await _context.FormulariosSolicitacao
                .Include(f => f.Aluno)
                    .ThenInclude(a => a.Usuario)
                .ToListAsync();
        }

        // GET: api/formulariossolicitacao/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FormularioSolicitacao>> GetFormularioSolicitacao(int id)
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            var formulario = await _context.FormulariosSolicitacao
                .Include(f => f.Aluno)
                    .ThenInclude(a => a.Usuario)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (formulario == null)
            {
                return NotFound();
            }

            return formulario;
        }

        // GET: api/formulariossolicitacao/aluno/5
        [HttpGet("aluno/{alunoId}")]
        public async Task<ActionResult<IEnumerable<FormularioSolicitacao>>> GetFormulariosPorAluno(int alunoId)
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            return await _context.FormulariosSolicitacao
                .Where(f => f.AlunoId == alunoId)
                .OrderByDescending(f => f.DataEnvio)
                .ToListAsync();
        }

        // POST: api/formulariossolicitacao
        [HttpPost]
        public async Task<ActionResult<FormularioSolicitacao>> PostFormularioSolicitacao(FormularioSolicitacao formulario)
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            _context.FormulariosSolicitacao.Add(formulario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFormularioSolicitacao), new { id = formulario.Id }, formulario);
        }

        // PUT: api/formulariossolicitacao/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormularioSolicitacao(int id, FormularioSolicitacao formulario)
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            if (id != formulario.Id)
            {
                return BadRequest();
            }

            _context.Entry(formulario).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FormularioSolicitacaoExists(id))
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

        // DELETE: api/formulariossolicitacao/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFormularioSolicitacao(int id)
        {
            // Verificar se o usuário é admin
            if (!IsAdmin())
            {
                return Forbid();
            }

            var formulario = await _context.FormulariosSolicitacao.FindAsync(id);
            if (formulario == null)
            {
                return NotFound();
            }

            _context.FormulariosSolicitacao.Remove(formulario);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FormularioSolicitacaoExists(int id)
        {
            return _context.FormulariosSolicitacao.Any(e => e.Id == id);
        }
    }
} 