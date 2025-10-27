# 🔍 GUIA DE TESTE - RESET DE SENHA

## ⚠️ PROBLEMA IDENTIFICADO
Erro 400 (Bad Request) na segunda tentativa de reset de senha.

## 🧪 PASSOS PARA TESTAR

### 1. 🚀 **Iniciar os Serviços**
```bash
# Terminal 1 - API
cd API
dotnet run

# Terminal 2 - Frontend  
cd Frontend
ng serve
```

### 2. 📧 **Gerar Token de Debug**
Use este endpoint no Postman ou similar:

```http
POST http://localhost:5160/api/auth/debug-generate-reset-token
Content-Type: application/json

{
  "email": "SEU_EMAIL_CADASTRADO"
}
```

**Resposta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "seu@email.com",
  "resetLink": "http://localhost:4200/auth/resetpassword?token=...",
  "message": "Token gerado com sucesso"
}
```

### 3. 🔗 **Testar no Browser**
1. **Copie o `resetLink`** da resposta
2. **Cole no navegador** ou vá direto para: `http://localhost:4200/auth/resetpassword?token=TOKEN_AQUI`
3. **Digite uma nova senha** (mínimo 6 caracteres)
4. **Confirme a senha**
5. **Clique em "Enviar"**

### 4. 🔍 **Verificar Logs**

**No console do navegador (F12):**
```
=== RESET PASSWORD DEBUG ===
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Nova senha length: 8
Confirmar senha length: 8
Todas as validações passaram, enviando requisição...
```

**No console da API:**
```
[RESET-PASSWORD] Iniciando processo de reset de senha
[RESET-PASSWORD] Token recebido: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[RESET-PASSWORD] Email extraído do token: seu@email.com
[RESET-PASSWORD] Atualizando senha para usuário: seu@email.com
[RESET-PASSWORD] Senha atualizada com sucesso para: seu@email.com
```

## ❌ **Se der erro, verifique:**

### **Erro comum 1: Token expirado**
- Tokens duram **30 minutos**
- **Solução:** Gere um novo token

### **Erro comum 2: Token já usado**
- Tokens são de **uso único**
- **Solução:** Gere um novo token

### **Erro comum 3: Usuário não existe**
- Verifique se o email existe no banco
- **Solução:** Use um email cadastrado

## 🧪 **TESTE RÁPIDO VIA HTTP**

```http
### 1. Gerar token
POST http://localhost:5160/api/auth/debug-generate-reset-token
Content-Type: application/json
{ "email": "seu@email.com" }

### 2. Resetar senha (substitua TOKEN_AQUI)
POST http://localhost:5160/api/auth/reset-password
Content-Type: application/json
{
  "token": "TOKEN_AQUI",
  "novaSenha": "novaSenha123",
  "confirmarSenha": "novaSenha123"
}
```

## 📋 **CHECKLIST DE VERIFICAÇÃO**
- [ ] API rodando na porta 5160
- [ ] Frontend rodando na porta 4200
- [ ] Email existe no banco de dados
- [ ] Token foi gerado recentemente (< 30 min)
- [ ] Token não foi usado antes
- [ ] Console do navegador mostra logs detalhados
- [ ] Console da API mostra logs detalhados

**Teste agora e me envie os logs completos! 🚀** 