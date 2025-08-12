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
            var agendamentos = await _context.Agendamentos
                .Include(a => a.Aluno)
                    .ThenInclude(al => al.Usuario)
                .Include(a => a.Psicologo)
                    .ThenInclude(p => p.Usuario)
                .ToListAsync();

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

            // Verificar se o aluno já tem agendamento na mesma data e horário
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

            // Verificar se o psicólogo já tem agendamento na mesma data e horário
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

            return Ok(new { disponivel = true, message = "Horário disponível" });
        }

        // POST: api/agendamentos
        [HttpPost]
        public async Task<ActionResult<Agendamento>> PostAgendamento(Agendamento agendamento)
        {
            Console.WriteLine($"Recebido agendamento - Data: {agendamento.Data}, Horário: {agendamento.Horario}");
            Console.WriteLine($"AlunoId: {agendamento.AlunoId}, PsicologoId: {agendamento.PsicologoId}");
            
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
            try
            {
                Console.WriteLine($"Tentando excluir agendamento com ID: {id}");
                
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
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Erro na transação, fazendo rollback: {ex.Message}");
                    throw;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir agendamento: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return BadRequest($"Erro ao excluir agendamento: {ex.Message}");
            }
        }

        private bool AgendamentoExists(int id)
        {
            return _context.Agendamentos.Any(e => e.Id == id);
        }
    }
} 