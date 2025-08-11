using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Anotacao
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Aluno")]
        public int AlunoId { get; set; }

        [ForeignKey("Psicologo")]
        public int PsicologoId { get; set; }

        [Required]
        public string Descricao { get; set; }

        public DateOnly Data { get; set; }

        // Campo adicional para vincular a um agendamento específico (opcional)
        [ForeignKey("Agendamento")]
        public int? AgendamentoId { get; set; }

        [JsonIgnore]
        public virtual Aluno? Aluno { get; set; }
        
        [JsonIgnore]
        public virtual Psicologo? Psicologo { get; set; }
        
        [JsonIgnore]
        public virtual Agendamento? Agendamento { get; set; }
    }
} 