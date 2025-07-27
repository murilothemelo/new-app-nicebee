# 🚀 Instruções de Configuração - NiceBee MySQL cPanel

## ⚠️ PASSOS CRÍTICOS - Execute na ordem exata!

### 1. 📊 Configuração do Banco de Dados

#### 1.1 Importar Schema
1. Acesse **phpMyAdmin** no cPanel
2. Selecione o banco `nicebeec_cliente_eqarzc`
3. Vá em **Import**
4. Faça upload do arquivo `database_schema_cpanel.sql`
5. Clique em "Go"

### 2. 🔧 Configuração da API

#### 2.1 Verificar Arquivos
Certifique-se de que todos os arquivos da pasta `api/` estão no servidor:
```
/api/
├── .env (com suas credenciais)
├── .htaccess
├── index.php
├── test-connection.php
├── config/
│   ├── database.php
│   ├── cors.php
│   └── jwt.php
├── controllers/
│   └── AuthController.php
├── middleware/
│   └── auth.php
├── routes/
│   └── routes.php
├── utils/
│   ├── response.php
│   └── validation.php
└── uploads/
```

#### 2.2 Configurar Permissões
```bash
chmod 755 /api
chmod 644 /api/.htaccess
chmod 600 /api/.env
chmod 755 /api/uploads
```

### 3. ✅ Testar a API

#### 3.1 Teste de Conexão
1. Acesse: `https://api.nicebee.com.br/test-connection.php`
2. **Deve retornar:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "database": "nicebeec_cliente_eqarzc",
  "existing_tables": ["usuarios", "tipos_terapia", "planos_medicos"],
  "total_tables": 3
}
```

#### 3.2 Teste da API Base
1. Acesse: `https://api.nicebee.com.br`
2. **Deve retornar:**
```json
{
  "success": true,
  "message": "NiceBee API is running",
  "version": "1.0"
}
```

#### 3.3 Teste de Login
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

### 4. 🎨 Frontend

#### 4.1 Build Local
```bash
npm run build:prod
```

#### 4.2 Upload
1. Faça upload de **TODO** o conteúdo da pasta `dist/` para `/public`
2. Certifique-se de que o arquivo `.htaccess` está na pasta `/public`

### 5. 🔐 Credenciais de Teste

**Administrador:**
- Email: `admin@clinica.com`
- Senha: `admin123`

**Assistente:**
- Email: `assistente@clinica.com`
- Senha: `assist123`

**Profissional:**
- Email: `psicologo@clinica.com`
- Senha: `prof123`

### 6. 🚨 Solução de Problemas

#### Erro 500 na API:
1. Verifique logs em `/api/error_log`
2. Confirme se `.env` está configurado corretamente
3. Teste conexão: `https://api.nicebee.com.br/test-connection.php`

#### Erro de CORS:
1. Verifique se `FRONTEND_URL` no `.env` está correto
2. Confirme se mod_headers está ativo no Apache

#### Banco não conecta:
1. Verifique se as credenciais no `.env` estão corretas
2. Confirme se o usuário tem ALL PRIVILEGES
3. Teste conexão via phpMyAdmin

### 7. 📞 Comandos de Teste

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

---

## 🎯 Principais Correções Aplicadas:

✅ Removido qualquer referência ao Supabase  
✅ Configurado para MySQL puro com PDO  
✅ Ajustado para suas credenciais específicas do cPanel  
✅ Corrigido sistema de autenticação JWT  
✅ Configurado CORS para produção  
✅ Adicionado tratamento de erros robusto  
✅ Criado arquivo de teste de conexão  
✅ Schema otimizado com índices  
✅ Dados iniciais incluídos  

**Se seguir estas instruções, o sistema deve funcionar perfeitamente!**