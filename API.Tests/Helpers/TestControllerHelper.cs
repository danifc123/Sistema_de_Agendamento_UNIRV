using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SeuProjeto.Models;
using System.Security.Claims;

namespace API.Tests.Helpers
{
    public static class TestControllerHelper
    {
        public static void SetupUserClaims(ControllerBase controller, int userId, TipoUsuario tipo)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, userId.ToString()),
                new(ClaimTypes.Role, tipo.ToString())
            };

            var identity = new ClaimsIdentity(claims, "test");
            var principal = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        public static void SetupUserWithoutClaims(ControllerBase controller)
        {
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
        }
    }
} 