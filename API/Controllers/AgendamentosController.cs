using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgendamentosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/agendamentos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentos()
        {
            return await _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .ToListAsync();
        }

        // GET: api/agendamentos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Agendamento>> GetAgendamento(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null)
            {
                return NotFound();
            }

            return agendamento;
        }

        // GET: api/agendamentos/aluno/5
        [HttpGet("aluno/{alunoId}")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentosPorAluno(int alunoId)
        {
            return await _context.Agendamentos
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Where(a => a.AlunoId == alunoId)
                .ToListAsync();
        }

        // GET: api/agendamentos/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentosPorPsicologo(int psicologoId)
        {
            return await _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Where(a => a.PsicologoId == psicologoId)
                .ToListAsync();
        }

        // POST: api/agendamentos
        [HttpPost]
        public async Task<ActionResult<Agendamento>> PostAgendamento(Agendamento agendamento)
        {
            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAgendamento), new { id = agendamento.Id }, agendamento);
        }

        // PUT: api/agendamentos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAgendamento(int id, Agendamento agendamento)
        {
            if (id != agendamento.Id)
            {
                return BadRequest();
            }

            _context.Entry(agendamento).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AgendamentoExists(id))
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

        // PATCH: api/agendamentos/5/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusAgendamento status)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null)
            {
                return NotFound();
            }

            agendamento.Status = status;
            
            if (status == StatusAgendamento.Confirmado)
            {
                agendamento.DataConfirmacao = DateTime.Now;
            }
            else if (status == StatusAgendamento.Cancelado)
            {
                agendamento.DataCancelamento = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/agendamentos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgendamento(int id)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null)
            {
                return NotFound();
            }

            _context.Agendamentos.Remove(agendamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AgendamentoExists(int id)
        {
            return _context.Agendamentos.Any(e => e.Id == id);
        }
    }
} 