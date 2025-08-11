using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DisponibilidadesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisponibilidadesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/disponibilidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Disponibilidade>>> GetDisponibilidades()
        {
            return await _context.Disponibilidades
                .Include(d => d.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .ToListAsync();
        }

        // GET: api/disponibilidades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Disponibilidade>> GetDisponibilidade(int id)
        {
            var disponibilidade = await _context.Disponibilidades
                .Include(d => d.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (disponibilidade == null)
            {
                return NotFound();
            }

            return disponibilidade;
        }

        // GET: api/disponibilidades/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Disponibilidade>>> GetDisponibilidadesPorPsicologo(int psicologoId)
        {
            return await _context.Disponibilidades
                .Where(d => d.PsicologoId == psicologoId)
                .OrderBy(d => d.Data)
                .ThenBy(d => d.HoraInicio)
                .ToListAsync();
        }

        // POST: api/disponibilidades
        [HttpPost]
        public async Task<ActionResult<Disponibilidade>> PostDisponibilidade(Disponibilidade disponibilidade)
        {
            _context.Disponibilidades.Add(disponibilidade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDisponibilidade), new { id = disponibilidade.Id }, disponibilidade);
        }

        // PUT: api/disponibilidades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutDisponibilidade(int id, Disponibilidade disponibilidade)
        {
            if (id != disponibilidade.Id)
            {
                return BadRequest();
            }

            _context.Entry(disponibilidade).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!DisponibilidadeExists(id))
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

        // DELETE: api/disponibilidades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDisponibilidade(int id)
        {
            var disponibilidade = await _context.Disponibilidades.FindAsync(id);
            if (disponibilidade == null)
            {
                return NotFound();
            }

            _context.Disponibilidades.Remove(disponibilidade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool DisponibilidadeExists(int id)
        {
            return _context.Disponibilidades.Any(e => e.Id == id);
        }
    }
} 