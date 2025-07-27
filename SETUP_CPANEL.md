# 🚀 Guia de Configuração cPanel - NiceBee

## ⚠️ CHECKLIST CRÍTICO - Execute na ordem exata!

### 1. 📊 Configuração do Banco de Dados

#### 1.1 Criar Banco via cPanel
1. Acesse **MySQL Databases** no cPanel
2. Em "Create New Database":
   - Nome: `nicebee_db`
   - Clique em "Create Database"

#### 1.2 Criar Usuário
1. Em "MySQL Users":
   - Username: `nicebee_user`
   - Password: **[ANOTE A SENHA - você vai precisar!]**
   - Clique em "Create User"

#### 1.3 Adicionar Usuário ao Banco
1. Em "Add User to Database":
   - User: `seuusuario_nicebee_user`
   - Database: `seuusuario_nicebee_db`
   - Clique em "Add"
2. **IMPORTANTE**: Marque **ALL PRIVILEGES**
3. Clique em "Make Changes"

#### 1.4 Importar Schema
1. Acesse **phpMyAdmin** no cPanel
2. Selecione o banco `seuusuario_nicebee_db`
3. Vá em **Import**
4. Faça upload do arquivo `database_schema_cpanel.sql`
5. Clique em "Go"

### 2. 🔧 Configuração da API

#### 2.1 Upload dos Arquivos
1. No **File Manager** do cPanel, crie a pasta `/api`
2. Faça upload de todos os arquivos da pasta `api/`
3. **Estrutura final deve ser:**
```
/public_html/api/
├── .htaccess
├── .env
├── index.php
├── test-connection.php
├── composer.json
├── config/
├── controllers/
├── middleware/
├── routes/
├── utils/
└── uploads/
```

#### 2.2 Configurar .env
1. Copie o arquivo `.env.example` para `.env`
2. **EDITE o arquivo .env com SEUS dados:**

```env
# SUBSTITUA pelos seus dados reais do cPanel!
DB_HOST=localhost
DB_NAME=seuusuario_nicebee_db
DB_USER=seuusuario_nicebee_user
DB_PASS=SUA_SENHA_DO_BANCO_AQUI

# Gere uma chave JWT de 64 caracteres
JWT_SECRET=sua_chave_jwt_super_secreta_de_64_caracteres_aqui_muito_segura_2024

ENVIRONMENT=production
DEBUG=false
FRONTEND_URL=https://app.nicebee.com.br
```

#### 2.3 Configurar Permissões
No **Terminal** do cPanel (se disponível) ou via File Manager:
```bash
chmod 755 /public_html/api
chmod 644 /public_html/api/.htaccess
chmod 600 /public_html/api/.env
chmod 755 /public_html/api/uploads
```

#### 2.4 Instalar Dependências PHP
Se o cPanel tem Composer:
```bash
cd /public_html/api
composer install --no-dev
```

**OU** faça upload manual da pasta `vendor/` após rodar `composer install` localmente.

### 3. 🌐 Configuração dos Subdomínios

#### 3.1 Criar Subdomínios
1. No cPanel, acesse **Subdomains**
2. Crie:
   - **Subdomain**: `api`
   - **Document Root**: `/public_html/api`
   - Clique em "Create"
3. Crie:
   - **Subdomain**: `app`
   - **Document Root**: `/public_html/public`
   - Clique em "Create"

### 4. ✅ Testar a API

#### 4.1 Teste de Conexão
1. Acesse: `https://api.nicebee.com.br/test-connection.php`
2. **Deve retornar algo como:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "database": "seuusuario_nicebee_db",
  "existing_tables": ["usuarios", "tipos_terapia", "planos_medicos"],
  "total_tables": 3
}
```

#### 4.2 Teste da API Base
1. Acesse: `https://api.nicebee.com.br`
2. **Deve retornar:**
```json
{
  "success": true,
  "message": "NiceBee API is running",
  "version": "1.0"
}
```

#### 4.3 Teste de Login
Use um cliente REST (Postman, Insomnia) ou curl:
```bash
curl -X POST https://api.nicebee.com.br/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}'
```

**Deve retornar:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "ey...",
    "user": {...}
  }
}
```

### 5. 🎨 Deploy do Frontend

#### 5.1 Build Local
No seu computador:
```bash
npm run build:prod
```

#### 5.2 Upload
1. No cPanel, crie a pasta `/public`
2. Faça upload de **TODO** o conteúdo da pasta `dist/` para `/public`

### 6. 🔒 Configurar SSL

1. No cPanel, acesse **SSL/TLS**
2. Vá em **Let's Encrypt**
3. Ative SSL para:
   - `api.nicebee.com.br`
   - `app.nicebee.com.br`
4. Force redirecionamento HTTPS

### 7. 🚨 Solução de Problemas

#### Erro 500 na API:
1. Verifique logs em `/api/error_log`
2. Confirme se `.env` está configurado corretamente
3. Teste conexão: `https://api.nicebee.com.br/test-connection.php`

#### Erro de CORS:
1. Verifique se `FRONTEND_URL` no `.env` está correto
2. Confirme se mod_headers está ativo no Apache

#### Banco não conecta:
1. Verifique se o nome do banco inclui o prefixo do usuário
2. Confirme se o usuário tem ALL PRIVILEGES
3. Teste conexão via phpMyAdmin

#### Frontend não carrega:
1. Verifique se `.htaccess` está na pasta `/public`
2. Confirme se mod_rewrite está ativo
3. Verifique se os assets foram enviados corretamente

### 8. 📞 Comandos de Teste

```bash
# Testar API
curl https://api.nicebee.com.br

# Testar conexão banco
curl https://api.nicebee.com.br/test-connection.php

# Testar login
curl -X POST https://api.nicebee.com.br/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}'
```

### 9. 🔐 Credenciais Padrão

**Administrador:**
- Email: `admin@clinica.com`
- Senha: `admin123`

**Assistente:**
- Email: `assistente@clinica.com`
- Senha: `assist123`

**Profissional:**
- Email: `psicologo@clinica.com`
- Senha: `prof123`

**⚠️ ALTERE TODAS AS SENHAS APÓS PRIMEIRO LOGIN!**

---

## 🎯 Pontos Críticos Verificados:

✅ Carregamento correto das variáveis de ambiente  
✅ Validação de configuração do banco  
✅ Tratamento de erros de conexão  
✅ CORS configurado para produção  
✅ Logs detalhados para debug  
✅ Arquivo de teste de conexão  
✅ Schema otimizado com índices  
✅ Dados iniciais incluídos  
✅ Permissões de arquivo corretas  
✅ Estrutura de pastas organizada  

**Se seguir este guia exatamente, a conexão com o banco deve funcionar perfeitamente!**