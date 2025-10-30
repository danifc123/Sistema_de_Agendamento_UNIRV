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
    public class DisponibilidadesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DisponibilidadesController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(idClaim, out var userId)) return userId;
            return null;
        }

        private bool IsPsicologo() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Psicologo.ToString(), StringComparison.OrdinalIgnoreCase);
        private bool IsAdmin() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

        // GET: api/disponibilidades/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Disponibilidade>>> GetPorPsicologo(int psicologoId)
        {
            var userId = GetCurrentUserId();
            if (IsPsicologo() && userId.HasValue && psicologoId != userId.Value)
            {
                return Forbid();
            }

            return await _context.Disponibilidades
                .Where(d => d.PsicologoId == psicologoId)
                .OrderByDescending(d => d.Data)
                .ThenBy(d => d.HoraInicio)
                .ToListAsync();
        }

        public class CriarDisponibilidadeRequest
        {
            public int PsicologoId { get; set; }
            public DateOnly Data { get; set; }
            public TimeOnly HoraInicio { get; set; }
            public TimeOnly HoraFim { get; set; }
        }

        // POST: api/disponibilidades
        [HttpPost]
        public async Task<ActionResult<Disponibilidade>> Post([FromBody] CriarDisponibilidadeRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { message = "Requisição inválida" });
            }

            var userId = GetCurrentUserId();
            if (IsPsicologo() && userId.HasValue && request.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            if (request.HoraFim <= request.HoraInicio)
            {
                return BadRequest(new { message = "Hora fim deve ser maior que hora início" });
            }

            // Opcional: evitar sobreposição de bloqueios
            var existeSobreposicao = await _context.Disponibilidades.AnyAsync(d =>
                d.PsicologoId == request.PsicologoId &&
                d.Data == request.Data &&
                !(request.HoraFim <= d.HoraInicio || request.HoraInicio >= d.HoraFim)
            );

            if (existeSobreposicao)
            {
                return BadRequest(new { message = "Já existe um bloqueio para este período" });
            }

            var disp = new Disponibilidade
            {
                PsicologoId = request.PsicologoId,
                Data = request.Data,
                HoraInicio = request.HoraInicio,
                HoraFim = request.HoraFim
            };

            _context.Disponibilidades.Add(disp);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPorPsicologo), new { psicologoId = disp.PsicologoId }, disp);
        }

        // PUT: api/disponibilidades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CriarDisponibilidadeRequest request)
        {
            var disp = await _context.Disponibilidades.FindAsync(id);
            if (disp == null) return NotFound();

            var userId = GetCurrentUserId();
            if (IsPsicologo() && userId.HasValue && disp.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            // Validar se não é data/hora passada
            var dataHoraInicio = request.Data.ToDateTime(request.HoraInicio);
            if (dataHoraInicio < DateTime.Now)
            {
                return BadRequest(new { message = "Não é possível alterar bloqueio para data/horário que já passou." });
            }

            if (request.HoraFim <= request.HoraInicio)
            {
                return BadRequest(new { message = "Hora fim deve ser maior que hora início" });
            }

            // Verificar sobreposição (excluindo o próprio registro)
            var existeSobreposicao = await _context.Disponibilidades.AnyAsync(d =>
                d.Id != id &&
                d.PsicologoId == request.PsicologoId &&
                d.Data == request.Data &&
                !(request.HoraFim <= d.HoraInicio || request.HoraInicio >= d.HoraFim)
            );

            if (existeSobreposicao)
            {
                return BadRequest(new { message = "Já existe um bloqueio para este período" });
            }

            disp.Data = request.Data;
            disp.HoraInicio = request.HoraInicio;
            disp.HoraFim = request.HoraFim;

            _context.Entry(disp).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/disponibilidades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var disp = await _context.Disponibilidades.FindAsync(id);
            if (disp == null) return NotFound();

            var userId = GetCurrentUserId();
            if (IsPsicologo() && userId.HasValue && disp.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            // Validar se não é data/hora passada
            var dataHoraInicio = disp.Data.ToDateTime(disp.HoraInicio);
            if (dataHoraInicio < DateTime.Now)
            {
                return BadRequest(new { message = "Não é possível excluir bloqueio para data/horário que já passou." });
            }

            _context.Disponibilidades.Remove(disp);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 