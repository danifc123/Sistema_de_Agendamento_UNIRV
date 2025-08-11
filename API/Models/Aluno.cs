using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Aluno
    {
        [Key, ForeignKey("Usuario")]
        public int Id { get; set; }

        [Required, MaxLength(20)]
        public string Matricula { get; set; }

        [Required, MaxLength(100)]
        public string Curso { get; set; }

        public int Semestre { get; set; }

        public virtual Usuario? Usuario { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Agendamento>? Agendamentos { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Anotacao>? Anotacoes { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<FormularioSolicitacao>? FormulariosSolicitacao { get; set; }
    }
} 