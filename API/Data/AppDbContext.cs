using Microsoft.EntityFrameworkCore;
using SeuProjeto.Models;

namespace SeuProjeto.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Aluno> Alunos => Set<Aluno>();
        public DbSet<Psicologo> Psicologos => Set<Psicologo>();
        public DbSet<Agendamento> Agendamentos => Set<Agendamento>();
        public DbSet<Disponibilidade> Disponibilidades => Set<Disponibilidade>();
        public DbSet<Anotacao> Anotacoes => Set<Anotacao>();
        public DbSet<FormularioSolicitacao> FormulariosSolicitacao => Set<FormularioSolicitacao>();

        protected override void OnModelCreating(ModelBuilder model)
        {
            // Usuario: email único e enum como string
            model.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            model.Entity<Usuario>()
                .Property(u => u.Tipo)
                .HasConversion<string>();

            // Agendamento: enum como string
            model.Entity<Agendamento>()
                .Property(a => a.Status)
                .HasConversion<string>();

            // 1-1 Aluno <-> Usuario (PK compartilhada)
            model.Entity<Aluno>()
                .HasOne(a => a.Usuario)
                .WithOne(u => u.Aluno)
                .HasForeignKey<Aluno>(a => a.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // 1-1 Psicologo <-> Usuario (PK compartilhada)
            model.Entity<Psicologo>()
                .HasOne(p => p.Usuario)
                .WithOne(u => u.Psicologo)
                .HasForeignKey<Psicologo>(p => p.Id)
                .OnDelete(DeleteBehavior.Cascade);

            // Unicidades
            model.Entity<Aluno>()
                .HasIndex(a => a.Matricula)
                .IsUnique();

            model.Entity<Psicologo>()
                .HasIndex(p => p.Crp)
                .IsUnique();

            // Relacionamentos principais
            model.Entity<Agendamento>()
                .HasOne(a => a.Aluno)
                .WithMany(al => al.Agendamentos)
                .HasForeignKey(a => a.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);

            model.Entity<Agendamento>()
                .HasOne(a => a.Psicologo)
                .WithMany(p => p.Agendamentos)
                .HasForeignKey(a => a.PsicologoId)
                .OnDelete(DeleteBehavior.Restrict);

            model.Entity<Disponibilidade>()
                .HasOne(d => d.Psicologo)
                .WithMany(p => p.Disponibilidades)
                .HasForeignKey(d => d.PsicologoId)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Anotacao>()
                .HasOne(n => n.Aluno)
                .WithMany(a => a.Anotacoes)
                .HasForeignKey(n => n.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Anotacao>()
                .HasOne(n => n.Psicologo)
                .WithMany(p => p.Anotacoes)
                .HasForeignKey(n => n.PsicologoId)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Anotacao>()
                .HasOne(n => n.Agendamento)
                .WithMany()
                .HasForeignKey(n => n.AgendamentoId)
                .OnDelete(DeleteBehavior.SetNull);

            model.Entity<FormularioSolicitacao>()
                .HasOne(f => f.Aluno)
                .WithMany(a => a.FormulariosSolicitacao)
                .HasForeignKey(f => f.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
} 