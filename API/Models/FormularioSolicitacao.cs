using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class FormularioSolicitacao
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Aluno")]
        public int AlunoId { get; set; }

        [Required]
        public string Motivo { get; set; }

        public string Observacoes { get; set; }

        public DateOnly DataEnvio { get; set; }

        [JsonIgnore]
        public virtual Aluno? Aluno { get; set; }
    }
} 