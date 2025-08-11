using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnotacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnotacoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/anotacoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoes()
        {
            return await _context.Anotacoes
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Include(a => a.Agendamento)
                .ToListAsync();
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

            return anotacao;
        }

        // GET: api/anotacoes/aluno/5
        [HttpGet("aluno/{alunoId}")]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoesPorAluno(int alunoId)
        {
            return await _context.Anotacoes
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Include(a => a.Agendamento)
                .Where(a => a.AlunoId == alunoId)
                .OrderByDescending(a => a.Data)
                .ToListAsync();
        }

        // GET: api/anotacoes/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoesPorPsicologo(int psicologoId)
        {
            return await _context.Anotacoes
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Agendamento)
                .Where(a => a.PsicologoId == psicologoId)
                .OrderByDescending(a => a.Data)
                .ToListAsync();
        }

        // POST: api/anotacoes
        [HttpPost]
        public async Task<ActionResult<Anotacao>> PostAnotacao(Anotacao anotacao)
        {
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