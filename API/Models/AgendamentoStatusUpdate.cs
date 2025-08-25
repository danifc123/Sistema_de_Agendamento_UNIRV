using System.ComponentModel.DataAnnotations;

namespace SeuProjeto.Models
{
	public class AgendamentoStatusUpdate
	{
		[Required]
		public StatusAgendamento Status { get; set; }
	}
} 