using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormulariosSolicitacaoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FormulariosSolicitacaoController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/formulariossolicitacao
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FormularioSolicitacao>>> GetFormulariosSolicitacao()
        {
            return await _context.FormulariosSolicitacao
                .Include(f => f.Aluno)
                    .ThenInclude(a => a.Usuario)
                .ToListAsync();
        }

        // GET: api/formulariossolicitacao/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FormularioSolicitacao>> GetFormularioSolicitacao(int id)
        {
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
            return await _context.FormulariosSolicitacao
                .Where(f => f.AlunoId == alunoId)
                .OrderByDescending(f => f.DataEnvio)
                .ToListAsync();
        }

        // POST: api/formulariossolicitacao
        [HttpPost]
        public async Task<ActionResult<FormularioSolicitacao>> PostFormularioSolicitacao(FormularioSolicitacao formulario)
        {
            _context.FormulariosSolicitacao.Add(formulario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFormularioSolicitacao), new { id = formulario.Id }, formulario);
        }

        // PUT: api/formulariossolicitacao/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFormularioSolicitacao(int id, FormularioSolicitacao formulario)
        {
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