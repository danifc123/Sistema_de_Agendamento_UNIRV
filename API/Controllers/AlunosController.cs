using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using SeuProjeto.Models;

namespace SeuProjeto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/alunos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aluno>>> GetAlunos()
        {
            return await _context.Alunos
                .Include(a => a.Usuario)
                .ToListAsync();
        }

        // GET: api/alunos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Aluno>> GetAluno(int id)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Usuario)
                .Include(a => a.Agendamentos)
                .Include(a => a.Anotacoes)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (aluno == null)
            {
                return NotFound();
            }

            return aluno;
        }

        // GET: api/alunos/matricula/12345
        [HttpGet("matricula/{matricula}")]
        public async Task<ActionResult<Aluno>> GetAlunoPorMatricula(string matricula)
        {
            var aluno = await _context.Alunos
                .Include(a => a.Usuario)
                .FirstOrDefaultAsync(a => a.Matricula == matricula);

            if (aluno == null)
            {
                return NotFound();
            }

            return aluno;
        }

        // POST: api/alunos
        [HttpPost]
        public async Task<ActionResult<Aluno>> PostAluno(Aluno aluno)
        {
            try
            {
                // Verificar se o usuário existe
                var usuario = await _context.Usuarios.FindAsync(aluno.Id);
                if (usuario == null)
                {
                    return BadRequest($"Usuário com ID {aluno.Id} não encontrado.");
                }

                // Verificar se já existe um aluno com este ID
                var alunoExistente = await _context.Alunos.FindAsync(aluno.Id);
                if (alunoExistente != null)
                {
                    return BadRequest($"Aluno com ID {aluno.Id} já existe.");
                }

                // Verificar se a matrícula já existe
                var matriculaExistente = await _context.Alunos.FirstOrDefaultAsync(a => a.Matricula == aluno.Matricula);
                if (matriculaExistente != null)
                {
                    return BadRequest($"Matrícula {aluno.Matricula} já está em uso.");
                }

                // Configurar o relacionamento
                aluno.Usuario = usuario;
                
                _context.Alunos.Add(aluno);
                await _context.SaveChangesAsync();

                // Retornar apenas os dados do aluno sem o usuário incluído
                return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, aluno);
            }
            catch (Exception ex)
            {
                // Log do erro para debug
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT: api/alunos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluno(int id, [FromBody] object updateData)
        {
            
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null)
            {
                return NotFound();
            }


            try
            {
                // Converter o objeto dinâmico para um dicionário
                var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(
                    System.Text.Json.JsonSerializer.Serialize(updateData));


                // Atualizar apenas os campos fornecidos
                if (data.ContainsKey("Matricula"))
                {
                    aluno.Matricula = data["Matricula"].ToString();
                }
                if (data.ContainsKey("Curso"))
                {
                    aluno.Curso = data["Curso"].ToString();
                }
                if (data.ContainsKey("Semestre"))
                {
                    if (int.TryParse(data["Semestre"].ToString(), out var semestre))
                    {
                        aluno.Semestre = semestre;
                    }
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao atualizar aluno: {ex.Message}");
            }
        }

        // DELETE: api/alunos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluno(int id)
        {
            try
            {
                Console.WriteLine($"Tentando excluir aluno com ID: {id}");
                
                // Usar SQL raw para garantir que todos os relacionamentos sejam excluídos
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Desabilitar verificação de chaves estrangeiras temporariamente
                    await _context.Database.ExecuteSqlRawAsync("SET session_replication_role = replica;");
                    Console.WriteLine("Verificação de FK desabilitada");

                    // Excluir todos os dados relacionados
                    var anotacoesDeletadas = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Anotacoes\" WHERE \"AlunoId\" = {0} OR \"AgendamentoId\" IN (SELECT \"Id\" FROM \"Agendamentos\" WHERE \"AlunoId\" = {0})", id);
                    Console.WriteLine($"Excluídas {anotacoesDeletadas} anotações");

                    var agendamentosDeletados = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Agendamentos\" WHERE \"AlunoId\" = {0}", id);
                    Console.WriteLine($"Excluídos {agendamentosDeletados} agendamentos");

                    var formulariosDeletados = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"FormulariosSolicitacao\" WHERE \"AlunoId\" = {0}", id);
                    Console.WriteLine($"Excluídos {formulariosDeletados} formulários");

                    var alunoDeletado = await _context.Database.ExecuteSqlRawAsync(
                        "DELETE FROM \"Alunos\" WHERE \"Id\" = {0}", id);
                    Console.WriteLine($"Aluno excluído: {alunoDeletado > 0}");

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
                Console.WriteLine($"Erro ao excluir aluno: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return BadRequest($"Erro ao excluir aluno: {ex.Message}");
            }
        }

        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.Id == id);
        }
    }
} 