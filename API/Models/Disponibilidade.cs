using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Disponibilidade
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Psicologo")]
        public int PsicologoId { get; set; }

        public DateOnly Data { get; set; }
        public TimeOnly HoraInicio { get; set; }
        public TimeOnly HoraFim { get; set; }

        [JsonIgnore]
        public virtual Psicologo? Psicologo { get; set; }
    }
} 