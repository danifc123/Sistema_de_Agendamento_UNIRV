using Microsoft.EntityFrameworkCore;
using SeuProjeto.Data;
using System.Text.Json.Serialization;
using System.Text.Json;
using SeuProjeto.Converters;
using SeuProjeto.Services;
using SeuProjeto.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
        // policy.WithOrigins("http://localhost:4200") // Porta padrão do Angular
        //       .AllowAnyHeader()
        //       .AllowAnyMethod();

        policy.WithOrigins("https://frontend-production-25f9.up.railway.app") // Porta padrão do Angular
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configurar JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("Email"));

// DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configurar JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var key = Encoding.ASCII.GetBytes(jwtSettings?.SecretKey ?? "3a964dea4e97f5c3c1c780973874bf63fdb193857adb6356e779a51b19f804fb");

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings?.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings?.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Registrar serviços
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient<IEmailService, EmailService>();

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

// Usar Authentication e Authorization
app.UseAuthentication();
app.UseAuthorization();

// Re-hash de senhas em texto puro (fallback):
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var usuariosTextoClaro = ctx.Usuarios.Where(u => !u.Senha.StartsWith("$2"));
    foreach (var u in usuariosTextoClaro)
    {
        u.Senha = BCrypt.Net.BCrypt.HashPassword(u.Senha);
    }
    if (usuariosTextoClaro.Any())
    {
        ctx.SaveChanges();
    }
}

app.MapControllers();

app.Run();