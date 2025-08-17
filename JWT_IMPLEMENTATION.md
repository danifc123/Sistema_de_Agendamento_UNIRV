# 🔐 Implementação JWT - Sistema de Agendamento UNIRV

## 📋 Visão Geral

Este documento descreve a implementação completa de autenticação JWT (JSON Web Token) no sistema de agendamento da UNIRV.

## 🏗️ Arquitetura Implementada

### Backend (.NET 9)
- **JWT Service**: Geração e validação de tokens
- **Auth Service**: Lógica de autenticação e registro
- **BCrypt**: Hash seguro de senhas
- **Guards**: Proteção de endpoints por roles

### Frontend (Angular 19)
- **Auth Service**: Gerenciamento de autenticação
- **HTTP Interceptor**: Adição automática de tokens
- **Route Guards**: Proteção de rotas
- **Local Storage**: Persistência de tokens

## 🔧 Configuração

### 1. Backend - Dependências
```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.8" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.3.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
```

### 2. Configuração JWT (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "sua_chave_secreta_muito_longa_e_segura_aqui_minimo_32_caracteres",
    "Issuer": "SistemaAgendamentoUNIRV",
    "Audience": "PRAEUsers",
    "ExpirationHours": 24
  }
}
```

## 🚀 Endpoints Implementados

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/refresh` - Renovação de token
- `GET /api/auth/me` - Informações do usuário atual

### Exemplo de Login
```json
POST /api/auth/login
{
  "email": "admin@teste.com",
  "senha": "123456"
}
```

### Login Root (Usuário Administrador Hardcoded)
```json
POST /api/auth/login
{
  "email": "root",
  "senha": "1234"
}
```

**Nota:** O usuário root aceita "root" em maiúsculo ou minúsculo e não é armazenado no banco de dados.

### Resposta de Sucesso
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_aqui",
  "expiresAt": "2024-01-16T10:00:00.000Z",
  "user": {
    "id": 1,
    "nome": "Admin Teste",
    "email": "admin@teste.com",
    "tipo": "Admin"
  },
  "message": "Login realizado com sucesso"
}
```

## 🛡️ Proteção de Endpoints

### Backend - Atributo Authorize
```csharp
[Authorize(TipoUsuario.Admin)]
[HttpGet("admin-only")]
public IActionResult AdminEndpoint() { }

[Authorize(TipoUsuario.Admin, TipoUsuario.Psicologo)]
[HttpGet("admin-psicologo")]
public IActionResult AdminPsicologoEndpoint() { }
```

### Frontend - Route Guards
```typescript
{
  path: 'relatorio',
  component: RelatorioComponent,
  canActivate: [RoleGuard],
  data: { roles: ['Admin', 'Psicologo'] }
}
```

## 🔄 Fluxo de Autenticação

### 1. Login
1. Usuário submete credenciais
2. Backend valida email/senha com BCrypt
3. Gera JWT token + refresh token
4. Retorna tokens para frontend
5. Frontend armazena no localStorage

### 2. Requisições Autenticadas
1. Frontend faz requisição HTTP
2. Interceptor adiciona `Authorization: Bearer <token>`
3. Backend valida token
4. Se válido: processa requisição
5. Se inválido: retorna 401

### 3. Refresh Token
1. Token expira (401)
2. Interceptor tenta refresh automaticamente
3. Se refresh falha: logout e redireciona para login
4. Se refresh sucesso: continua requisição

## 🎯 Roles e Permissões

### Tipos de Usuário
- **Root**: Usuário administrador hardcoded (não armazenado no banco)
  - Login: `root` (maiúsculo ou minúsculo)
  - Senha: `1234`
  - Acesso total ao sistema
- **Admin**: Acesso total ao sistema
- **Psicologo**: Acesso a agendamentos e relatórios
- **Aluno**: Acesso básico (agendamentos próprios)

### Endpoints por Role
- **Admin**: Todos os endpoints
- **Psicologo**: Agendamentos, relatórios, anotações
- **Aluno**: Agendamentos próprios, formulários

## 🔒 Segurança Implementada

### 1. Senhas
- Hash com BCrypt (salt automático)
- Mínimo 6 caracteres
- Validação de confirmação

### 2. Tokens
- JWT com assinatura HMAC-SHA256
- Expiração configurável (24h padrão)
- Refresh tokens para renovação

### 3. Validação
- Verificação de issuer/audience
- Validação de expiração
- Verificação de assinatura

## 📱 Frontend - Funcionalidades

### AuthService
```typescript
// Login
authService.login(credentials).subscribe()

// Verificar autenticação
if (authService.isAuthenticated()) { }

// Verificar role
if (authService.isAdmin()) { }

// Logout
authService.logout()
```

### Interceptor Automático
- Adiciona token em todas as requisições
- Trata erros 401 automaticamente
- Refresh token transparente

### Route Guards
- `AuthGuard`: Verifica se está logado
- `RoleGuard`: Verifica permissões específicas

## 🧪 Testes

### Usando o arquivo test-jwt.http
1. Execute o backend
2. Use o VS Code com extensão REST Client
3. Execute os testes no arquivo `test-jwt.http`

### Testes Manuais
1. Registre um usuário
2. Faça login
3. Teste endpoints protegidos
4. Teste expiração de token

## 🚨 Troubleshooting

### Erro 401
- Verificar se token está sendo enviado
- Verificar se token não expirou
- Verificar se usuário tem permissão

### Erro de CORS
- Verificar configuração CORS no backend
- Verificar origem do frontend

### Token não sendo enviado
- Verificar se interceptor está configurado
- Verificar se token está no localStorage

## 📝 Próximos Passos

1. **Implementar Refresh Token Completo**
   - Armazenar refresh tokens no banco
   - Implementar revogação de tokens

2. **Melhorar Segurança**
   - Rate limiting
   - Logs de auditoria
   - Validação de força de senha

3. **Funcionalidades Adicionais**
   - Recuperação de senha
   - Verificação de email
   - Login social

## 🔧 Comandos Úteis

### Backend
```bash
# Instalar dependências
dotnet restore

# Executar migrações
dotnet ef database update

# Executar aplicação
dotnet run
```

### Frontend
```bash
# Instalar dependências
npm install

# Executar aplicação
npm start
```

## 📞 Suporte

Para dúvidas sobre a implementação JWT, consulte:
- Documentação oficial JWT
- Documentação do Angular
- Documentação do .NET

---

**Implementação JWT Completa! 🎉**

O sistema agora possui autenticação segura com JWT, protegendo endpoints e rotas conforme necessário. 