using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Psicologo
    {
        [Key, ForeignKey("Usuario")]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Crp { get; set; }

        [MaxLength(100)]
        public string Especialidade { get; set; }

        public virtual Usuario? Usuario { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Agendamento>? Agendamentos { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Disponibilidade>? Disponibilidades { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Anotacao>? Anotacoes { get; set; }
    }
} 