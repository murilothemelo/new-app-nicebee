# 🚀 Guia de Deploy - NiceBee (cPanel + MySQL + PHP)

## 📋 Pré-requisitos

### Servidor/Hosting
- cPanel com suporte a PHP 7.4+
- MySQL 5.7+ ou MariaDB 10.2+
- Composer (se disponível) ou upload manual
- Subdomínios configurados:
  - `api.nicebee.com.br` → pasta `/api`
  - `app.nicebee.com.br` → pasta `/public`

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco via cPanel
1. Acesse **MySQL Databases** no cPanel
2. Crie um novo banco: `nicebee_db`
3. Crie um usuário: `nicebee_user`
4. Defina uma senha forte
5. Adicione o usuário ao banco com **ALL PRIVILEGES**

### 2. Importar Schema
1. Acesse **phpMyAdmin** no cPanel
2. Selecione o banco `nicebee_db`
3. Vá em **Import**
4. Faça upload do arquivo `database_schema.sql`
5. Execute a importação

### 3. Criar Usuário Admin Inicial
Execute no phpMyAdmin:
```sql
INSERT INTO usuarios (nome, email, password, tipo, status) 
VALUES ('Administrator', 'admin@clinica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ativo');
-- Senha: password (altere após primeiro login)
```

## 🔧 Deploy da API (api.nicebee.com.br)

### 1. Upload dos Arquivos
1. Crie a pasta `/api` no seu cPanel
2. Faça upload de todos os arquivos da pasta `api/`
3. Estrutura final:
```
/api/
├── .htaccess
├── .env
├── index.php
├── composer.json
├── config/
├── controllers/
├── middleware/
├── routes/
├── utils/
└── uploads/
```

### 2. Instalar Dependências
**Opção A - Se tiver Composer no servidor:**
```bash
cd /home/seuusuario/public_html/api
composer install --no-dev --optimize-autoloader
```

**Opção B - Upload manual:**
1. Execute `composer install` localmente
2. Faça upload da pasta `vendor/` gerada

### 3. Configurar Variáveis de Ambiente
Edite o arquivo `/api/.env`:
```env
DB_HOST=localhost
DB_NAME=seuusuario_nicebee_db
DB_USER=seuusuario_nicebee_user
DB_PASS=sua_senha_do_banco
DB_CHARSET=utf8mb4

JWT_SECRET=sua_chave_jwt_super_secreta_de_64_caracteres_aqui_muito_segura_2024
JWT_EXPIRE=86400

ENVIRONMENT=production
DEBUG=false

UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=uploads/

FRONTEND_URL=https://app.nicebee.com.br
```

### 4. Configurar Permissões
```bash
chmod 755 /api
chmod 644 /api/.htaccess
chmod 600 /api/.env
chmod 755 /api/uploads
chmod 644 /api/uploads/.htaccess
```

### 5. Testar API
Acesse: `https://api.nicebee.com.br`
Deve retornar: `{"message": "Rota não encontrada"}`

Teste login: `POST https://api.nicebee.com.br/login`
```json
{
  "email": "admin@clinica.com",
  "password": "password"
}
```

## 🌐 Deploy do Frontend (app.nicebee.com.br)

### 1. Build do Projeto
No seu ambiente local:
```bash
npm run build
```

### 2. Upload dos Arquivos
1. Crie a pasta `/public` no cPanel
2. Faça upload de todo o conteúdo da pasta `dist/`
3. Estrutura final:
```
/public/
├── .htaccess
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

### 3. Configurar Subdomínios no cPanel
1. Acesse **Subdomains**
2. Crie `api` apontando para `/api`
3. Crie `app` apontando para `/public`

### 4. Configurar SSL
1. Acesse **SSL/TLS**
2. Ative **Let's Encrypt** para ambos subdomínios
3. Force HTTPS redirect

## 🔒 Configurações de Segurança

### 1. Proteger Arquivos Sensíveis
Adicione ao `.htaccess` principal:
```apache
<Files ~ "^\.env">
    Order allow,deny
    Deny from all
</Files>

<Files ~ "config\.php">
    Order allow,deny
    Deny from all
</Files>
```

### 2. Configurar PHP (se possível)
No `php.ini` ou `.htaccess`:
```ini
expose_php = Off
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 30
memory_limit = 128M
```

### 3. Backup Automático
Configure backup automático no cPanel:
1. **Backup Wizard**
2. Agende backup diário
3. Inclua banco de dados e arquivos

## 📊 Monitoramento

### 1. Logs de Erro
- PHP: `/api/error_log`
- Apache: Painel de logs do cPanel

### 2. Monitoramento de Uptime
Configure monitoramento externo:
- UptimeRobot
- Pingdom
- StatusCake

### 3. Performance
- Use **CloudFlare** para CDN
- Ative compressão Gzip
- Configure cache de browser

## 🔄 Processo de Atualização

### 1. API
```bash
# Backup atual
cp -r /api /api_backup_$(date +%Y%m%d)

# Upload novos arquivos
# Manter .env e uploads/

# Testar
curl https://api.nicebee.com.br/user
```

### 2. Frontend
```bash
# Build local
npm run build

# Backup atual
cp -r /public /public_backup_$(date +%Y%m%d)

# Upload novo build
# Manter .htaccess
```

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Banco de dados criado e configurado
- [ ] Usuário admin criado
- [ ] SSL configurado para ambos subdomínios
- [ ] Variáveis de ambiente configuradas

### API
- [ ] Arquivos PHP enviados
- [ ] Composer dependencies instaladas
- [ ] Permissões configuradas
- [ ] .htaccess funcionando
- [ ] Teste de login funcionando

### Frontend
- [ ] Build gerado localmente
- [ ] Arquivos enviados para /public
- [ ] .htaccess configurado
- [ ] Roteamento SPA funcionando
- [ ] Conexão com API funcionando

### Pós-Deploy
- [ ] Teste completo da aplicação
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação atualizada
- [ ] Senha admin alterada

## 🆘 Troubleshooting

### Problemas Comuns

**1. Erro 500 na API:**
- Verificar logs PHP
- Verificar permissões de arquivo
- Verificar sintaxe .htaccess

**2. CORS Error:**
- Verificar FRONTEND_URL no .env
- Verificar headers CORS
- Verificar mod_headers ativo

**3. Banco não conecta:**
- Verificar credenciais .env
- Verificar nome do banco (prefixo usuário)
- Verificar se usuário tem permissões

**4. Frontend não carrega:**
- Verificar .htaccess do frontend
- Verificar se mod_rewrite está ativo
- Verificar paths dos assets

**5. Upload não funciona:**
- Verificar permissões pasta uploads/
- Verificar php.ini limits
- Verificar .htaccess uploads/

### Comandos Úteis

```bash
# Verificar logs
tail -f /api/error_log

# Testar conexão banco
php -r "new PDO('mysql:host=localhost;dbname=nome_banco', 'usuario', 'senha');"

# Verificar permissões
ls -la /api/

# Testar .htaccess
curl -I https://api.nicebee.com.br/.env
```

## 📞 Suporte

Para problemas específicos:
1. Verificar logs de erro
2. Testar endpoints individualmente
3. Verificar configurações cPanel
4. Contatar suporte do hosting se necessário

---

**Importante:** Sempre faça backup antes de qualquer alteração em produção!