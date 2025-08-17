using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Nome { get; set; }

        [Required, MaxLength(150)]
        public string Email { get; set; }

        [Required]
        public string Senha { get; set; } = string.Empty;

        [Required]
        public TipoUsuario Tipo { get; set; }

        [JsonIgnore]
        public virtual Aluno? Aluno { get; set; }

        [JsonIgnore]
        public virtual Psicologo? Psicologo { get; set; }
    }
} 