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
    public class AgendamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgendamentosController(AppDbContext context)
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

        // GET: api/agendamentos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentos()
        {
            var query = _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .AsQueryable();

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue)
            {
                // Aluno só enxerga seus próprios registros (AlunoId == UsuarioId)
                query = query.Where(a => a.AlunoId == userId.Value);
            }
            else if (IsPsicologo() && userId.HasValue)
            {
                // Psicólogo vê apenas seus atendimentos
                query = query.Where(a => a.PsicologoId == userId.Value);
            }
            // Admin vê tudo

            var agendamentos = await query.ToListAsync();

            Console.WriteLine($"Retornando {agendamentos.Count} agendamentos");
            foreach (var agendamento in agendamentos)
            {
                Console.WriteLine($"Agendamento ID {agendamento.Id}: Data={agendamento.Data}, Horário={agendamento.Horario}");
            }

            return agendamentos;
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

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && agendamento.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && agendamento.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            return agendamento;
        }

        // GET: api/agendamentos/aluno/5
        [HttpGet("aluno/{alunoId}")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentosPorAluno(int alunoId)
        {
            var userId = GetCurrentUserId();
            if (IsAluno())
            {
                // Aluno só pode consultar o próprio ID
                if (!userId.HasValue || alunoId != userId.Value) return Forbid();
            }

            var query = _context.Agendamentos
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .Where(a => a.AlunoId == alunoId);

            if (IsPsicologo() && userId.HasValue)
            {
                // Psicólogo só vê seus próprios atendimentos deste aluno
                query = query.Where(a => a.PsicologoId == userId.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/agendamentos/psicologo/5
        [HttpGet("psicologo/{psicologoId}")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> GetAgendamentosPorPsicologo(int psicologoId)
        {
            var userId = GetCurrentUserId();
            if (IsPsicologo())
            {
                // Psicólogo só pode consultar o próprio ID
                if (!userId.HasValue || psicologoId != userId.Value) return Forbid();
            }

            var query = _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Where(a => a.PsicologoId == psicologoId);

            if (IsAluno() && userId.HasValue)
            {
                // Aluno só vê seus próprios registros com esse psicólogo
                query = query.Where(a => a.AlunoId == userId.Value);
            }

            return await query.ToListAsync();
        }

        // GET: api/agendamentos/filtrar?data=YYYY-MM-DD&psicologoId=ID
        [HttpGet("filtrar")]
        public async Task<ActionResult<IEnumerable<Agendamento>>> FiltrarAgendamentos(
            [FromQuery] string? data = null,
            [FromQuery] int? psicologoId = null)
        {
            var query = _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .AsQueryable();

            // Aplicar filtro de data se fornecido
            if (!string.IsNullOrEmpty(data) && DateOnly.TryParse(data, out var dataParsed))
            {
                query = query.Where(a => a.Data == dataParsed);
            }

            // Aplicar filtro de psicólogo se fornecido
            if (psicologoId.HasValue)
            {
                query = query.Where(a => a.PsicologoId == psicologoId.Value);
            }

            // Aplicar regras de permissão
            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue)
            {
                query = query.Where(a => a.AlunoId == userId.Value);
            }
            else if (IsPsicologo() && userId.HasValue)
            {
                query = query.Where(a => a.PsicologoId == userId.Value);
            }

            var agendamentos = await query.ToListAsync();
            return Ok(agendamentos);
        }

        // GET: api/agendamentos/verificar-disponibilidade
        [HttpGet("verificar-disponibilidade")]
        public async Task<ActionResult<object>> VerificarDisponibilidade(
            [FromQuery] int alunoId, 
            [FromQuery] int psicologoId, 
            [FromQuery] string data, 
            [FromQuery] string horario)
        {
            if (!DateOnly.TryParse(data, out var dataParsed))
            {
                return BadRequest(new { message = "Data inválida" });
            }

            // Converter horário string para TimeOnly
            if (!TimeOnly.TryParse(horario, out var horarioParsed))
            {
                return BadRequest(new { message = "Horário inválido" });
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

            // 1) Verificar se o aluno já tem agendamento na mesma data e horário
            var agendamentoExistenteAluno = await _context.Agendamentos
                .Where(a => a.AlunoId == alunoId 
                           && a.Data == dataParsed 
                           && a.Horario == horarioParsed
                           && a.Status != StatusAgendamento.Cancelado)
                .FirstOrDefaultAsync();

            if (agendamentoExistenteAluno != null)
            {
                var aluno = await _context.Alunos
                    .Include(a => a.Usuario)
                    .FirstOrDefaultAsync(a => a.Id == alunoId);
                
                return Ok(new { 
                    disponivel = false, 
                    message = $"O aluno {aluno?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {dataParsed:dd/MM/yyyy} às {horario}.",
                    tipo = "aluno"
                });
            }

            // 2) Verificar se o psicólogo já tem agendamento na mesma data e horário
            var agendamentoExistentePsicologo = await _context.Agendamentos
                .Where(a => a.PsicologoId == psicologoId 
                           && a.Data == dataParsed 
                           && a.Horario == horarioParsed
                           && a.Status != StatusAgendamento.Cancelado)
                .FirstOrDefaultAsync();

            if (agendamentoExistentePsicologo != null)
            {
                var psicologo = await _context.Psicologos
                    .Include(p => p.Usuario)
                    .FirstOrDefaultAsync(p => p.Id == psicologoId);
                
                return Ok(new { 
                    disponivel = false, 
                    message = $"O psicólogo {psicologo?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {dataParsed:dd/MM/yyyy} às {horario}.",
                    tipo = "psicologo"
                });
            }

            // 3) Verificar bloqueios de disponibilidade do psicólogo (considerar como indisponível)
            var bloqueado = await _context.Disponibilidades
                .Where(d => d.PsicologoId == psicologoId && d.Data == dataParsed)
                .AnyAsync(d => horarioParsed >= d.HoraInicio && horarioParsed < d.HoraFim);

            if (bloqueado)
            {
                return Ok(new {
                    disponivel = false,
                    message = $"Horário indisponível para o psicólogo em {dataParsed:dd/MM/yyyy} às {horario}.",
                    tipo = "bloqueio"
                });
            }

            return Ok(new { disponivel = true, message = "Horário disponível" });
        }

        // POST: api/agendamentos
        [HttpPost]
        public async Task<ActionResult<Agendamento>> PostAgendamento(Agendamento agendamento)
        {
            Console.WriteLine($"Recebido agendamento - Data: {agendamento.Data}, Horário: {agendamento.Horario}");
            Console.WriteLine($"AlunoId: {agendamento.AlunoId}, PsicologoId: {agendamento.PsicologoId}");
            
            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && agendamento.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && agendamento.PsicologoId != userId.Value)
            {
                return Forbid();
            }
            
            // Validar se o aluno já tem agendamento na mesma data e horário
            var agendamentoExistenteAluno = await _context.Agendamentos
                .Where(a => a.AlunoId == agendamento.AlunoId 
                           && a.Data == agendamento.Data 
                           && a.Horario == agendamento.Horario
                           && a.Status != StatusAgendamento.Cancelado)
                .FirstOrDefaultAsync();

            if (agendamentoExistenteAluno != null)
            {
                var aluno = await _context.Alunos
                    .Include(a => a.Usuario)
                    .FirstOrDefaultAsync(a => a.Id == agendamento.AlunoId);
                
                var mensagem = $"O aluno {aluno?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {agendamento.Data:dd/MM/yyyy} às {agendamento.Horario}.";
                Console.WriteLine($"Validação falhou: {mensagem}");
                return BadRequest(new { message = mensagem });
            }

            // Validar se o psicólogo já tem agendamento na mesma data e horário
            var agendamentoExistentePsicologo = await _context.Agendamentos
                .Where(a => a.PsicologoId == agendamento.PsicologoId 
                           && a.Data == agendamento.Data 
                           && a.Horario == agendamento.Horario
                           && a.Status != StatusAgendamento.Cancelado)
                .FirstOrDefaultAsync();

            if (agendamentoExistentePsicologo != null)
            {
                var psicologo = await _context.Psicologos
                    .Include(p => p.Usuario)
                    .FirstOrDefaultAsync(p => p.Id == agendamento.PsicologoId);
                
                var mensagem = $"O psicólogo {psicologo?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {agendamento.Data:dd/MM/yyyy} às {agendamento.Horario}.";
                Console.WriteLine($"Validação falhou: {mensagem}");
                return BadRequest(new { message = mensagem });
            }
            
            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Agendamento salvo com ID: {agendamento.Id}");
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

            var userId = GetCurrentUserId();
            if (IsAluno() && userId.HasValue && agendamento.AlunoId != userId.Value)
            {
                return Forbid();
            }
            if (IsPsicologo() && userId.HasValue && agendamento.PsicologoId != userId.Value)
            {
                return Forbid();
            }

            // Buscar agendamento existente para verificar se data/horário mudaram
            var agendamentoExistente = await _context.Agendamentos.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
            if (agendamentoExistente == null)
            {
                return NotFound();
            }

            // Se data ou horário mudaram, validar conflitos e bloqueios
            if (agendamento.Data != agendamentoExistente.Data || agendamento.Horario != agendamentoExistente.Horario)
            {
                // Validar se o aluno já tem agendamento na nova data/horário (exceto este próprio)
                var conflitoAluno = await _context.Agendamentos
                    .Where(a => a.Id != id 
                               && a.AlunoId == agendamento.AlunoId 
                               && a.Data == agendamento.Data 
                               && a.Horario == agendamento.Horario
                               && a.Status != StatusAgendamento.Cancelado)
                    .FirstOrDefaultAsync();

                if (conflitoAluno != null)
                {
                    var aluno = await _context.Alunos
                        .Include(a => a.Usuario)
                        .FirstOrDefaultAsync(a => a.Id == agendamento.AlunoId);
                    
                    return BadRequest(new { message = $"O aluno {aluno?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {agendamento.Data:dd/MM/yyyy} às {agendamento.Horario}." });
                }

                // Validar se o psicólogo já tem agendamento na nova data/horário (exceto este próprio)
                var conflitoPsicologo = await _context.Agendamentos
                    .Where(a => a.Id != id 
                               && a.PsicologoId == agendamento.PsicologoId 
                               && a.Data == agendamento.Data 
                               && a.Horario == agendamento.Horario
                               && a.Status != StatusAgendamento.Cancelado)
                    .FirstOrDefaultAsync();

                if (conflitoPsicologo != null)
                {
                    var psicologo = await _context.Psicologos
                        .Include(p => p.Usuario)
                        .FirstOrDefaultAsync(p => p.Id == agendamento.PsicologoId);
                    
                    return BadRequest(new { message = $"O psicólogo {psicologo?.Usuario?.Nome ?? "N/A"} já possui um agendamento para {agendamento.Data:dd/MM/yyyy} às {agendamento.Horario}." });
                }

                // Validar bloqueios de disponibilidade do psicólogo
                var bloqueado = await _context.Disponibilidades
                    .Where(d => d.PsicologoId == agendamento.PsicologoId && d.Data == agendamento.Data)
                    .AnyAsync(d => agendamento.Horario >= d.HoraInicio && agendamento.Horario < d.HoraFim);

                if (bloqueado)
                {
                    return BadRequest(new {
                        message = $"Horário indisponível para o psicólogo em {agendamento.Data:dd/MM/yyyy} às {agendamento.Horario}."
                    });
                }
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
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] AgendamentoStatusUpdate update)
        {
            try
            {
                if (update == null)
                {
                    return BadRequest(new { message = "Corpo da requisição inválido" });
                }

                var agendamento = await _context.Agendamentos.FindAsync(id);
                if (agendamento == null)
                {
                    return NotFound(new { message = $"Agendamento {id} não encontrado" });
                }

                var userId = GetCurrentUserId();
                if (IsAluno() && userId.HasValue && agendamento.AlunoId != userId.Value)
                {
                    return Forbid();
                }
                if (IsPsicologo() && userId.HasValue && agendamento.PsicologoId != userId.Value)
                {
                    return Forbid();
                }

                var status = update.Status;
                agendamento.Status = status;
                
                if (status == StatusAgendamento.Confirmado)
                {
                    agendamento.DataConfirmacao = DateTime.UtcNow;
                }
                else if (status == StatusAgendamento.Cancelado)
                {
                    agendamento.DataCancelamento = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao atualizar status do agendamento", detail = ex.Message });
            }
        }

        // DELETE: api/agendamentos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgendamento(int id)
        {
            try
            {
                var agendamento = await _context.Agendamentos.FindAsync(id);
                if (agendamento == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                if (IsAluno() && userId.HasValue && agendamento.AlunoId != userId.Value)
                {
                    return Forbid();
                }
                if (IsPsicologo() && userId.HasValue && agendamento.PsicologoId != userId.Value)
                {
                    return Forbid();
                }

                // Usar SQL raw para garantir que todos os relacionamentos sejam excluídos
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Desabilitar verificação de chaves estrangeiras temporariamente
                    await _context.Database.ExecuteSqlRawAsync("SET session_replication_role = replica;");
                    Console.WriteLine("Verificação de FK desabilitada");

                    // Excluir anotações que referenciam este agendamento
                    var anotacoesDeletadas = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Anotacoes\" WHERE \"AgendamentoId\" = {0}", id);
                    Console.WriteLine($"Excluídas {anotacoesDeletadas} anotações");

                    // Excluir o agendamento
                    var agendamentoDeletado = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Agendamentos\" WHERE \"Id\" = {0}", id);
                    Console.WriteLine($"Agendamento excluído: {agendamentoDeletado > 0}");

                    // Reabilitar verificação de chaves estrangeiras
                    await _context.Database.ExecuteSqlRawAsync("SET session_replication_role = DEFAULT;");
                    Console.WriteLine("Verificação de FK reabilitada");

                    await transaction.CommitAsync();
                    Console.WriteLine("Transação commitada com sucesso");

                    return NoContent();
                }
                catch (Exception ex)
                {
                    await _context.Database.ExecuteSqlRawAsync("SET session_replication_role = DEFAULT;");
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = "Erro ao excluir agendamento", detail = ex.Message });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao processar a exclusão", detail = ex.Message });
            }
        }

        private bool AgendamentoExists(int id)
        {
            return _context.Agendamentos.Any(e => e.Id == id);
        }
    }
} 