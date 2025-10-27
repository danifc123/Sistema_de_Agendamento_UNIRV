using Microsoft.Extensions.Options;
using SeuProjeto.Models;

namespace API.Tests.Helpers
{
    public static class TestJwtHelper
    {
        public static IOptions<JwtSettings> CreateMockJwtSettings()
        {
            var jwtSettings = new JwtSettings
            {
                SecretKey = "super-secret-key-for-testing-with-256-bits-length",
                Issuer = "TestIssuer",
                Audience = "TestAudience", 
                ExpirationHours = 24
            };

            return Options.Create(jwtSettings);
        }
    }
} 