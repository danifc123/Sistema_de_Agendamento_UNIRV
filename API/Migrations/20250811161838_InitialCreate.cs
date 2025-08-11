using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Senha = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Alunos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Matricula = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Curso = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Semestre = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alunos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alunos_Usuarios_Id",
                        column: x => x.Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Psicologos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false),
                    Crp = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Especialidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Psicologos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Psicologos_Usuarios_Id",
                        column: x => x.Id,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormulariosSolicitacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlunoId = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "text", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: false),
                    DataEnvio = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormulariosSolicitacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormulariosSolicitacao_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Agendamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlunoId = table.Column<int>(type: "integer", nullable: false),
                    PsicologoId = table.Column<int>(type: "integer", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    Horario = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DataConfirmacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DataCancelamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Psicologos_PsicologoId",
                        column: x => x.PsicologoId,
                        principalTable: "Psicologos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Disponibilidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PsicologoId = table.Column<int>(type: "integer", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    HoraInicio = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    HoraFim = table.Column<TimeOnly>(type: "time without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Disponibilidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Disponibilidades_Psicologos_PsicologoId",
                        column: x => x.PsicologoId,
                        principalTable: "Psicologos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Anotacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlunoId = table.Column<int>(type: "integer", nullable: false),
                    PsicologoId = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    AgendamentoId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Anotacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Anotacoes_Agendamentos_AgendamentoId",
                        column: x => x.AgendamentoId,
                        principalTable: "Agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Anotacoes_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Anotacoes_Psicologos_PsicologoId",
                        column: x => x.PsicologoId,
                        principalTable: "Psicologos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_AlunoId",
                table: "Agendamentos",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_PsicologoId",
                table: "Agendamentos",
                column: "PsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Alunos_Matricula",
                table: "Alunos",
                column: "Matricula",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Anotacoes_AgendamentoId",
                table: "Anotacoes",
                column: "AgendamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Anotacoes_AlunoId",
                table: "Anotacoes",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Anotacoes_PsicologoId",
                table: "Anotacoes",
                column: "PsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_Disponibilidades_PsicologoId",
                table: "Disponibilidades",
                column: "PsicologoId");

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosSolicitacao_AlunoId",
                table: "FormulariosSolicitacao",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Psicologos_Crp",
                table: "Psicologos",
                column: "Crp",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Anotacoes");

            migrationBuilder.DropTable(
                name: "Disponibilidades");

            migrationBuilder.DropTable(
                name: "FormulariosSolicitacao");

            migrationBuilder.DropTable(
                name: "Agendamentos");

            migrationBuilder.DropTable(
                name: "Alunos");

            migrationBuilder.DropTable(
                name: "Psicologos");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
