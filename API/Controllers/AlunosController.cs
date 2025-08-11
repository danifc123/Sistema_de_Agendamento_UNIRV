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
                Console.WriteLine($"Erro ao criar aluno: {ex.Message}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // PUT: api/alunos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAluno(int id, Aluno aluno)
        {
            if (id != aluno.Id)
            {
                return BadRequest();
            }

            _context.Entry(aluno).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlunoExists(id))
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

        // DELETE: api/alunos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAluno(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);
            if (aluno == null)
            {
                return NotFound();
            }

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlunoExists(int id)
        {
            return _context.Alunos.Any(e => e.Id == id);
        }
    }
} 