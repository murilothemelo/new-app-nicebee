# NiceBee API - Backend

API completa para a Plataforma de Gestão Terapêutica NiceBee.

## 🚀 Instalação

1. **Clone o repositório e navegue para a pasta backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=nicebee_db
   JWT_SECRET=sua_chave_jwt_super_secreta_aqui_com_pelo_menos_32_caracteres
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://app.nicebee.com.br
   ```

4. **Configure o banco de dados:**
   - Crie um banco MySQL chamado `nicebee_db`
   - Execute o script SQL fornecido em `database_schema.sql`

5. **Inicie o servidor:**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm start
   ```

## 📁 Estrutura do Projeto

```
backend/
├── controllers/          # Controladores da aplicação
├── middleware/           # Middlewares (auth, security, etc.)
├── routes/              # Definição das rotas
├── utils/               # Utilitários (validação, database, etc.)
├── uploads/             # Arquivos enviados pelos usuários
├── index.js             # Arquivo principal
├── package.json         # Dependências e scripts
└── .env.example         # Exemplo de variáveis de ambiente
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer seu_token_aqui
```

## 📊 Endpoints Principais

### Autenticação
- `POST /api/v1/login` - Login do usuário
- `POST /api/v1/logout` - Logout do usuário
- `GET /api/v1/user` - Dados do usuário atual

### Pacientes
- `GET /api/v1/pacientes` - Listar pacientes
- `POST /api/v1/pacientes` - Criar paciente
- `GET /api/v1/pacientes/:id` - Obter paciente específico
- `PUT /api/v1/pacientes/:id` - Atualizar paciente
- `DELETE /api/v1/pacientes/:id` - Deletar paciente

### Agendamentos
- `GET /api/v1/agendamentos` - Listar agendamentos
- `POST /api/v1/agendamentos` - Criar agendamento
- `PUT /api/v1/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/v1/agendamentos/:id` - Deletar agendamento

### Evoluções
- `GET /api/v1/evolucoes` - Listar evoluções
- `POST /api/v1/evolucoes` - Criar evolução

### Prontuário Eletrônico
- `GET /api/v1/pacientes/:id/documentos` - Listar documentos
- `POST /api/v1/pacientes/:id/documentos` - Upload de documento
- `GET /api/v1/documentos/:id/download` - Download de documento

### Relatórios
- `GET /api/v1/relatorios` - Listar relatórios
- `POST /api/v1/relatorios` - Criar relatório

### Usuários (Admin)
- `GET /api/v1/usuarios` - Listar usuários
- `POST /api/v1/usuarios` - Criar usuário

### Outros
- `GET /api/v1/tipos-terapia` - Listar tipos de terapia
- `GET /api/v1/planos-medicos` - Listar planos médicos
- `GET /api/v1/comunidade` - Comentários da comunidade
- `POST /api/v1/comunidade` - Criar comentário
- `GET /api/v1/acompanhantes` - Listar acompanhantes
- `POST /api/v1/acompanhantes` - Criar acompanhante

## 🔒 Segurança

A API implementa várias medidas de segurança:

- **Rate Limiting**: Limita o número de requisições por IP
- **Helmet**: Headers de segurança HTTP
- **CORS**: Configurado para aceitar apenas o frontend autorizado
- **JWT**: Tokens com expiração de 24 horas
- **Bcrypt**: Hash seguro de senhas
- **Validação**: Sanitização e validação de inputs
- **Autorização**: Controle de acesso baseado em roles

## 🚀 Deploy

### Usando PM2 (Recomendado)

1. **Instale o PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Inicie a aplicação:**
   ```bash
   pm2 start index.js --name "nicebee-api"
   ```

3. **Configure para iniciar automaticamente:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Usando Docker

1. **Crie um Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build e execute:**
   ```bash
   docker build -t nicebee-api .
   docker run -p 3000:3000 --env-file .env nicebee-api
   ```

## 📝 Logs

Os logs são exibidos no console. Para produção, considere usar um sistema de logs como Winston.

## 🧪 Testes

```bash
npm test
```

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.