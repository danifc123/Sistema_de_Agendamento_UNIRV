using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SeuProjeto.Models
{
    public class Agendamento
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Aluno")]
        public int AlunoId { get; set; }

        [ForeignKey("Psicologo")]
        public int PsicologoId { get; set; }

        public DateOnly Data { get; set; }
        public TimeOnly Horario { get; set; }

        [Required]
        public StatusAgendamento Status { get; set; } = StatusAgendamento.Pendente;

        // Campos de auditoria
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public DateTime? DataConfirmacao { get; set; }
        public DateTime? DataCancelamento { get; set; }

        // Propriedades de navegação - sem JsonIgnore para incluir na resposta
        public virtual Aluno? Aluno { get; set; }
        public virtual Psicologo? Psicologo { get; set; }
    }
} 