# 🚀 Guia para Testar a API via Postman

## 📋 Configuração Base
- **URL Base:** `http://localhost:5160`
- **Content-Type:** `application/json`

## 🔧 Endpoints Disponíveis

### 1. USUARIOS
**Base URL:** `http://localhost:5160/api/usuarios`

#### GET - Listar Usuários
```
GET http://localhost:5160/api/usuarios
```

#### GET - Buscar Usuário por ID
```
GET http://localhost:5160/api/usuarios/{id}
```

#### POST - Criar Usuário
```
POST http://localhost:5160/api/usuarios
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "Aluno"
}
```

#### PUT - Atualizar Usuário
```
PUT http://localhost:5160/api/usuarios/{id}
Content-Type: application/json

{
  "id": 1,
  "nome": "João Silva Atualizado",
  "email": "joao.novo@email.com",
  "senha": "123456",
  "tipo": "Aluno"
}
```

#### DELETE - Remover Usuário
```
DELETE http://localhost:5160/api/usuarios/{id}
```

---

### 2. ALUNOS
**Base URL:** `http://localhost:5160/api/alunos`

#### GET - Listar Alunos
```
GET http://localhost:5160/api/alunos
```

#### GET - Buscar Aluno por ID
```
GET http://localhost:5160/api/alunos/{id}
```

#### GET - Buscar Aluno por Matrícula
```
GET http://localhost:5160/api/alunos/matricula/{matricula}
```

#### POST - Criar Aluno
```
POST http://localhost:5160/api/alunos
Content-Type: application/json

{
  "id": 1,
  "matricula": "2024001",
  "curso": "Sistemas de Informação",
  "semestre": 4
}
```

---

### 3. PSICOLOGOS
**Base URL:** `http://localhost:5160/api/psicologos`

#### GET - Listar Psicólogos
```
GET http://localhost:5160/api/psicologos
```

#### GET - Buscar Psicólogo por ID
```
GET http://localhost:5160/api/psicologos/{id}
```

#### GET - Buscar Psicólogo por CRP
```
GET http://localhost:5160/api/psicologos/crp/{crp}
```

#### POST - Criar Psicólogo
```
POST http://localhost:5160/api/psicologos
Content-Type: application/json

{
  "id": 2,
  "crp": "12345/SP",
  "especialidade": "Psicologia Clínica"
}
```

---

### 4. AGENDAMENTOS
**Base URL:** `http://localhost:5160/api/agendamentos`

#### GET - Listar Agendamentos
```
GET http://localhost:5160/api/agendamentos
```

#### GET - Buscar Agendamento por ID
```
GET http://localhost:5160/api/agendamentos/{id}
```

#### GET - Agendamentos por Aluno
```
GET http://localhost:5160/api/agendamentos/aluno/{alunoId}
```

#### GET - Agendamentos por Psicólogo
```
GET http://localhost:5160/api/agendamentos/psicologo/{psicologoId}
```

#### POST - Criar Agendamento
```
POST http://localhost:5160/api/agendamentos
Content-Type: application/json

{
  "alunoId": 1,
  "psicologoId": 2,
  "data": "2024-12-15",
  "horario": "14:00:00",
  "status": "Pendente"
}
```

#### PATCH - Atualizar Status
```
PATCH http://localhost:5160/api/agendamentos/{id}/status
Content-Type: application/json

"Confirmado"
```

---

### 5. DISPONIBILIDADES
**Base URL:** `http://localhost:5160/api/disponibilidades`

#### GET - Listar Disponibilidades
```
GET http://localhost:5160/api/disponibilidades
```

#### GET - Disponibilidades por Psicólogo
```
GET http://localhost:5160/api/disponibilidades/psicologo/{psicologoId}
```

#### POST - Criar Disponibilidade
```
POST http://localhost:5160/api/disponibilidades
Content-Type: application/json

{
  "psicologoId": 2,
  "data": "2024-12-15",
  "horaInicio": "08:00:00",
  "horaFim": "17:00:00"
}
```

---

### 6. ANOTACOES
**Base URL:** `http://localhost:5160/api/anotacoes`

#### GET - Listar Anotações
```
GET http://localhost:5160/api/anotacoes
```

#### GET - Anotações por Aluno
```
GET http://localhost:5160/api/anotacoes/aluno/{alunoId}
```

#### GET - Anotações por Psicólogo
```
GET http://localhost:5160/api/anotacoes/psicologo/{psicologoId}
```

#### POST - Criar Anotação
```
POST http://localhost:5160/api/anotacoes
Content-Type: application/json

{
  "alunoId": 1,
  "psicologoId": 2,
  "descricao": "Paciente apresentou melhora significativa",
  "data": "2024-12-15"
}
```

---

### 7. FORMULARIOS SOLICITACAO
**Base URL:** `http://localhost:5160/api/formulariossolicitacao`

#### GET - Listar Formulários
```
GET http://localhost:5160/api/formulariossolicitacao
```

#### GET - Formulários por Aluno
```
GET http://localhost:5160/api/formulariossolicitacao/aluno/{alunoId}
```

#### POST - Criar Formulário
```
POST http://localhost:5160/api/formulariossolicitacao
Content-Type: application/json

{
  "alunoId": 1,
  "motivo": "Primeira consulta",
  "observacoes": "Precisa de acompanhamento psicológico",
  "dataEnvio": "2024-12-15"
}
```

---

## 🧪 Sequência de Testes Recomendada

### 1. Criar Usuário
```json
POST http://localhost:5160/api/usuarios
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "tipo": "Aluno"
}
```

### 2. Criar Aluno
```json
POST http://localhost:5160/api/alunos
{
  "id": 1,
  "matricula": "2024001",
  "curso": "Sistemas de Informação",
  "semestre": 4
}
```

### 3. Criar Psicólogo
```json
POST http://localhost:5160/api/psicologos
{
  "id": 2,
  "crp": "12345/SP",
  "especialidade": "Psicologia Clínica"
}
```

### 4. Criar Agendamento
```json
POST http://localhost:5160/api/agendamentos
{
  "alunoId": 1,
  "psicologoId": 2,
  "data": "2024-12-15",
  "horario": "14:00:00",
  "status": "Pendente"
}
```

## 📝 Dicas para Postman

1. **Crie uma Collection** para organizar os requests
2. **Use Environment Variables** para a URL base
3. **Salve os IDs** retornados para usar em outros requests
4. **Teste os relacionamentos** verificando se os dados são incluídos

## 🔍 Verificações Importantes

- **Status Codes:** 200 (OK), 201 (Created), 204 (No Content)
- **Relacionamentos:** Verifique se os dados relacionados são incluídos
- **Validações:** Teste com dados inválidos para ver as mensagens de erro 