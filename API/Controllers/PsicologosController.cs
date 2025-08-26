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
    [Authorize]
    public class PsicologosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PsicologosController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin() => string.Equals(User?.FindFirst(ClaimTypes.Role)?.Value, TipoUsuario.Admin.ToString(), StringComparison.OrdinalIgnoreCase);

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

                // Verificar se o usuário existe (deve existir pois foi criado primeiro)
                var usuario = await _context.Usuarios.FindAsync(psicologo.Id);
                if (usuario == null)
                {
                    return BadRequest($"Usuário com ID {psicologo.Id} não encontrado. Certifique-se de criar o usuário primeiro.");
                }

                // Configurar o relacionamento
                psicologo.Usuario = usuario;
                
                _context.Psicologos.Add(psicologo);
                await _context.SaveChangesAsync();

                // Retornar o psicólogo criado com o usuário incluído
                var psicologoCriado = await _context.Psicologos
                    .Include(p => p.Usuario)
                    .FirstOrDefaultAsync(p => p.Id == psicologo.Id);

                return CreatedAtAction(nameof(GetPsicologo), new { id = psicologo.Id }, psicologoCriado);
            }
            catch (Exception ex)
            {
                // Log do erro para debug
                Console.WriteLine($"Erro ao criar psicólogo: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT: api/psicologos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPsicologo(int id, [FromBody] object updateData)
        {
            
            var psicologo = await _context.Psicologos.FindAsync(id);
            if (psicologo == null)
            {
                return NotFound();
            }


            try
            {
                // Converter o objeto dinâmico para um dicionário
                var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                    System.Text.Json.JsonSerializer.Serialize(updateData));


                // Atualizar apenas os campos fornecidos
                if (data.ContainsKey("Crp"))
                {
                    psicologo.Crp = data["Crp"].ToString();
                }
                if (data.ContainsKey("Especialidade"))
                {
                    psicologo.Especialidade = data["Especialidade"].ToString();
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao atualizar psicólogo: {ex.Message}");
            }
        }

        // DELETE: api/psicologos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePsicologo(int id)
        {
            try
            {
                Console.WriteLine($"Tentando excluir psicólogo com ID: {id}");
                
                // Usar SQL raw para garantir que todos os relacionamentos sejam excluídos
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Desabilitar verificação de chaves estrangeiras temporariamente
                    await _context.Database.ExecuteSqlRawAsync("SET session_replication_role = replica;");
                    Console.WriteLine("Verificação de FK desabilitada");

                    // Excluir anotações que referenciam agendamentos do psicólogo
                    var anotacoesDeletadas = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Anotacoes\" WHERE \"PsicologoId\" = {0} OR \"AgendamentoId\" IN (SELECT \"Id\" FROM \"Agendamentos\" WHERE \"PsicologoId\" = {0})", id);
                    Console.WriteLine($"Excluídas {anotacoesDeletadas} anotações");

                    // Excluir agendamentos
                    var agendamentosDeletados = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Agendamentos\" WHERE \"PsicologoId\" = {0}", id);
                    Console.WriteLine($"Excluídos {agendamentosDeletados} agendamentos");

                    // Excluir disponibilidades
                    var disponibilidadesDeletadas = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Disponibilidades\" WHERE \"PsicologoId\" = {0}", id);
                    Console.WriteLine($"Excluídas {disponibilidadesDeletadas} disponibilidades");

                    // Excluir o psicólogo
                    var psicologoDeletado = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Psicologos\" WHERE \"Id\" = {0}", id);
                    Console.WriteLine($"Psicólogo excluído: {psicologoDeletado > 0}");

                    // Excluir o usuário associado
                    var usuarioDeletado = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Usuarios\" WHERE \"Id\" = {0}", id);
                    Console.WriteLine($"Usuário excluído: {usuarioDeletado > 0}");

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
                Console.WriteLine($"Erro ao excluir psicólogo: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return BadRequest($"Erro ao excluir psicólogo: {ex.Message}");
            }
        }

        private bool PsicologoExists(int id)
        {
            return _context.Psicologos.Any(e => e.Id == id);
        }
    }
} 