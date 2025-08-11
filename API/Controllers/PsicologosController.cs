using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PsicologosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PsicologosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/psicologos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Psicologo>>> GetPsicologos()
        {
            return await _context.Psicologos
                .Include(p => p.Usuario)
                .ToListAsync();
        }

        // GET: api/psicologos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Psicologo>> GetPsicologo(int id)
        {
            var psicologo = await _context.Psicologos
                .Include(p => p.Usuario)
                .Include(p => p.Agendamentos)
                .Include(p => p.Disponibilidades)
                .Include(p => p.Anotacoes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (psicologo == null)
            {
                return NotFound();
            }

            return psicologo;
        }

        // GET: api/psicologos/crp/12345
        [HttpGet("crp/{crp}")]
        public async Task<ActionResult<Psicologo>> GetPsicologoPorCrp(string crp)
        {
            var psicologo = await _context.Psicologos
                .Include(p => p.Usuario)
                .FirstOrDefaultAsync(p => p.Crp == crp);

            if (psicologo == null)
            {
                return NotFound();
            }

            return psicologo;
        }

        // POST: api/psicologos
        [HttpPost]
        public async Task<ActionResult<Psicologo>> PostPsicologo(Psicologo psicologo)
        {
            try
            {
                // Verificar se o usuário existe
                var usuario = await _context.Usuarios.FindAsync(psicologo.Id);
                if (usuario == null)
                {
                    return BadRequest($"Usuário com ID {psicologo.Id} não encontrado.");
                }

                // Verificar se já existe um psicólogo com este ID
                var psicologoExistente = await _context.Psicologos.FindAsync(psicologo.Id);
                if (psicologoExistente != null)
                {
                    return BadRequest($"Psicólogo com ID {psicologo.Id} já existe.");
                }

                // Verificar se o CRP já existe
                var crpExistente = await _context.Psicologos.FirstOrDefaultAsync(p => p.Crp == psicologo.Crp);
                if (crpExistente != null)
                {
                    return BadRequest($"CRP {psicologo.Crp} já está em uso.");
                }

                // Configurar o relacionamento
                psicologo.Usuario = usuario;
                
                _context.Psicologos.Add(psicologo);
                await _context.SaveChangesAsync();

                // Retornar apenas os dados do psicólogo sem o usuário incluído
                return CreatedAtAction(nameof(GetPsicologo), new { id = psicologo.Id }, psicologo);
            }
            catch (Exception ex)
            {
                // Log do erro para debug
                Console.WriteLine($"Erro ao criar psicólogo: {ex.Message}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT: api/psicologos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPsicologo(int id, Psicologo psicologo)
        {
            if (id != psicologo.Id)
            {
                return BadRequest();
            }

            _context.Entry(psicologo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PsicologoExists(id))
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

        // DELETE: api/psicologos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePsicologo(int id)
        {
            var psicologo = await _context.Psicologos.FindAsync(id);
            if (psicologo == null)
            {
                return NotFound();
            }

            _context.Psicologos.Remove(psicologo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PsicologoExists(int id)
        {
            return _context.Psicologos.Any(e => e.Id == id);
        }
    }
} 