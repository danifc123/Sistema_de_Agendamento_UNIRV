using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeuProjeto.Converters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.PropertyNamingPolicy = null; // manter nomes conforme enviados
        
        // Configurar conversores para DateOnly e TimeOnly
        opts.JsonSerializerOptions.Converters.Add(new DateOnlyConverter());
        opts.JsonSerializerOptions.Converters.Add(new TimeOnlyConverter());
    });
builder.Services.AddEndpointsApiExplorer();

// CORS - Permitir acesso do Angular
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Porta padrão do Angular
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();

// Usar CORS
app.UseCors("AllowAngular");

app.UseAuthorization();
app.MapControllers();

app.Run();
