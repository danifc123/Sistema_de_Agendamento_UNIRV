using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesForAgendamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_AlunoId",
                table: "Agendamentos");

            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_PsicologoId",
                table: "Agendamentos");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_AlunoId_Data_Horario",
                table: "Agendamentos",
                columns: new[] { "AlunoId", "Data", "Horario" });

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_PsicologoId_Data_Horario",
                table: "Agendamentos",
                columns: new[] { "PsicologoId", "Data", "Horario" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_AlunoId_Data_Horario",
                table: "Agendamentos");

            migrationBuilder.DropIndex(
                name: "IX_Agendamentos_PsicologoId_Data_Horario",
                table: "Agendamentos");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_AlunoId",
                table: "Agendamentos",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_PsicologoId",
                table: "Agendamentos",
                column: "PsicologoId");
        }
    }
}
