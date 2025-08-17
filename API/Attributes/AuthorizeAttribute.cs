using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SeuProjeto.Models;
using SeuProjeto.Services;
using System.Security.Claims;

namespace SeuProjeto.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class AuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly TipoUsuario[] _allowedRoles;

        public AuthorizeAttribute(params TipoUsuario[] allowedRoles)
        {
            _allowedRoles = allowedRoles;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var token = context.HttpContext.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Token não fornecido" });
                return;
            }

            var jwtService = context.HttpContext.RequestServices.GetService<IJwtService>();
            if (jwtService == null)
            {
                context.Result = new StatusCodeResult(500);
                return;
            }

            var principal = jwtService.ValidateToken(token);
            if (principal == null)
            {
                context.Result = new UnauthorizedObjectResult(new { message = "Token inválido" });
                return;
            }

            // Verificar roles se especificadas
            if (_allowedRoles.Length > 0)
            {
                var userRole = principal.FindFirst(ClaimTypes.Role)?.Value;
                if (string.IsNullOrEmpty(userRole) || !_allowedRoles.Any(r => r.ToString() == userRole))
                {
                    context.Result = new ForbidResult();
                    return;
                }
            }

            // Adicionar claims ao contexto para uso posterior
            context.HttpContext.User = principal;
        }
    }
} 