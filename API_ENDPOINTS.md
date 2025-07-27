# Documentação da API - Plataforma de Gestão Terapêutica

**URL Base:** `https://api.nicebee.com.br/api/v1`

**Autenticação:** Bearer Token (JWT)

---

## 1. Autenticação

### `POST /login`
Autentica um usuário e retorna um token JWT.

**Request Body:**
```json
{
  "email": "admin@clinica.com",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "ey...",
  "user": {
    "id": 1,
    "nome": "Administrator",
    "email": "admin@clinica.com",
    "tipo": "admin",
    "especialidade_id": null
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Credenciais inválidas."
}
```

### `POST /logout`
Invalida o token de autenticação do usuário no servidor (opcional, mas recomendado).

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso."
}
```

### `GET /user`
Retorna os dados do usuário autenticado.

**Headers:**
`Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": 1,
  "nome": "Administrator",
  "email": "admin@clinica.com",
  "tipo": "admin",
  "especialidade_id": null
}
```

---

## 2. Pacientes

- `GET /pacientes`: Lista todos os pacientes (com filtros).
- `GET /pacientes/{id}`: Obtém um paciente específico.
- `POST /pacientes`: Cria um novo paciente.
- `PUT /pacientes/{id}`: Atualiza um paciente.
- `DELETE /pacientes/{id}`: Deleta um paciente.

---

## 3. Agenda

- `GET /agendamentos`: Lista agendamentos (filtros por data, profissional).
- `POST /agendamentos`: Cria um novo agendamento.
- `PUT /agendamentos/{id}`: Atualiza um agendamento.
- `DELETE /agendamentos/{id}`: Deleta um agendamento.

---

## 4. Evoluções

- `GET /evolucoes`: Lista evoluções (filtros por paciente, profissional).
- `POST /evolucoes`: Cria uma nova evolução.
- `PUT /evolucoes/{id}`: Atualiza uma evolução.
- `DELETE /evolucoes/{id}`: Deleta uma evolução.

---

## 5. Prontuário Eletrônico

- `GET /pacientes/{pacienteId}/documentos`: Lista documentos de um paciente.
- `POST /pacientes/{pacienteId}/documentos`: Faz upload de um novo documento. (multipart/form-data)
- `GET /documentos/{id}`: Obtém um documento específico (metadados).
- `GET /documentos/{id}/download`: Baixa o arquivo do documento.
- `DELETE /documentos/{id}`: Deleta um documento.

---

## 6. Usuários (Admin)

- `GET /usuarios`: Lista todos os usuários.
- `POST /usuarios`: Cria um novo usuário.
- `PUT /usuarios/{id}`: Atualiza um usuário.
- `DELETE /usuarios/{id}`: Deleta um usuário.

---

## 7. Outros Endpoints

- `/relatorios` (CRUD)
- `/planos-medicos` (CRUD)
- `/tipos-terapia` (CRUD)
- `/acompanhantes` (CRUD)
- `/comunidade` (CRUD de comentários)
- `/perfil` (PUT para dados, PUT para senha)
- `/configuracoes-pdf` (GET e PUT, apenas Admin)
