# 🚀 Guia de Deploy para Produção - NiceBee

## 📋 Pré-requisitos

### Servidor
- Ubuntu 20.04+ ou CentOS 8+
- Node.js 18+
- MySQL 8.0+
- Nginx
- SSL Certificate (Let's Encrypt recomendado)
- Domínio configurado (api.nicebee.com.br)

### Dependências do Sistema
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y curl wget gnupg2 software-properties-common

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# MySQL 8.0
sudo apt install -y mysql-server

# Nginx
sudo apt install -y nginx

# PM2 (Process Manager)
sudo npm install -g pm2
```

## 🗄️ Configuração do Banco de Dados

### 1. Configurar MySQL
```bash
sudo mysql_secure_installation

# Entrar no MySQL
sudo mysql -u root -p
```

### 2. Criar banco e usuário
```sql
CREATE DATABASE nicebee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nicebee_user'@'localhost' IDENTIFIED BY 'senha_super_segura_aqui';
GRANT ALL PRIVILEGES ON nicebee_db.* TO 'nicebee_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Importar schema
```bash
mysql -u nicebee_user -p nicebee_db < database_schema.sql
```

## 🔧 Deploy do Backend

### 1. Preparar diretório
```bash
sudo mkdir -p /var/www/nicebee-api
sudo chown $USER:$USER /var/www/nicebee-api
cd /var/www/nicebee-api
```

### 2. Clonar e configurar
```bash
# Upload dos arquivos do backend para o servidor
# Ou clone do repositório
git clone https://github.com/seu-repo/nicebee-backend.git .

# Instalar dependências
npm ci --only=production

# Criar diretório de uploads
mkdir -p uploads
chmod 755 uploads
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
nano .env
```

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_USER=nicebee_user
DB_PASSWORD=senha_super_segura_aqui
DB_NAME=nicebee_db

# JWT Secret (gere uma chave de 64 caracteres)
JWT_SECRET=sua_chave_jwt_super_secreta_de_64_caracteres_aqui_muito_segura

# Configurações do Servidor
PORT=3000
NODE_ENV=production

# URL do Frontend
FRONTEND_URL=https://app.nicebee.com.br

# Configurações de Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Configurar PM2
```bash
# Criar arquivo de configuração do PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nicebee-api',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🌐 Configuração do Nginx

### 1. Configurar proxy reverso
```bash
sudo nano /etc/nginx/sites-available/nicebee-api
```

```nginx
server {
    listen 80;
    server_name api.nicebee.com.br;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.nicebee.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.nicebee.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nicebee.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Client max body size (for file uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/nicebee-api/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Ativar configuração
```bash
sudo ln -s /etc/nginx/sites-available/nicebee-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.nicebee.com.br

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Deploy do Frontend

### 1. Build do frontend
```bash
# No seu ambiente local
cd frontend
npm run build
```

### 2. Upload para servidor
```bash
# Criar diretório
sudo mkdir -p /var/www/nicebee-frontend
sudo chown $USER:$USER /var/www/nicebee-frontend

# Upload da pasta dist/ para /var/www/nicebee-frontend/
```

### 3. Configurar Nginx para frontend
```bash
sudo nano /etc/nginx/sites-available/nicebee-frontend
```

```nginx
server {
    listen 80;
    server_name app.nicebee.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.nicebee.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.nicebee.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.nicebee.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/nicebee-frontend;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Ativar frontend
```bash
sudo ln -s /etc/nginx/sites-available/nicebee-frontend /etc/nginx/sites-enabled/
sudo certbot --nginx -d app.nicebee.com.br
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Configurações de Segurança

### 1. Firewall
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306 # MySQL (apenas se necessário acesso externo)
```

### 2. Fail2Ban
```bash
sudo apt install -y fail2ban

# Configurar
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

### 3. Backup automático
```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-nicebee.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/nicebee"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco de dados
mysqldump -u nicebee_user -p'senha_super_segura_aqui' nicebee_db > $BACKUP_DIR/db_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/nicebee-api uploads/

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-nicebee.sh

# Agendar backup diário
sudo crontab -e
# Adicionar:
0 2 * * * /usr/local/bin/backup-nicebee.sh
```

## 📊 Monitoramento

### 1. PM2 Monitoring
```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-server-monit

# Verificar status
pm2 status
pm2 logs
pm2 monit
```

### 2. Logs do sistema
```bash
# Logs da aplicação
tail -f /var/www/nicebee-api/logs/combined.log

# Logs do Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs do MySQL
tail -f /var/log/mysql/error.log
```

## 🔄 Atualizações

### Script de deploy
```bash
# Criar script de deploy
nano deploy.sh
```

```bash
#!/bin/bash
cd /var/www/nicebee-api

# Backup atual
cp -r . ../nicebee-api-backup-$(date +%Y%m%d_%H%M%S)

# Atualizar código
git pull origin main

# Instalar dependências
npm ci --only=production

# Reiniciar aplicação
pm2 restart nicebee-api

echo "Deploy concluído!"
```

## ✅ Checklist Final

- [ ] Banco de dados configurado e schema importado
- [ ] Backend rodando com PM2
- [ ] Nginx configurado com SSL
- [ ] Frontend buildado e servido
- [ ] Firewall configurado
- [ ] Backups automáticos configurados
- [ ] Monitoramento ativo
- [ ] Logs funcionando
- [ ] Domínios apontando corretamente
- [ ] SSL válido e renovação automática
- [ ] Testes de funcionalidade realizados

## 🆘 Troubleshooting

### Problemas comuns:

1. **Erro de conexão com banco:**
   - Verificar credenciais no .env
   - Verificar se MySQL está rodando: `sudo systemctl status mysql`

2. **API não responde:**
   - Verificar PM2: `pm2 status`
   - Verificar logs: `pm2 logs nicebee-api`

3. **Erro 502 Bad Gateway:**
   - Verificar se aplicação está rodando na porta correta
   - Verificar configuração do Nginx

4. **Problemas de SSL:**
   - Renovar certificado: `sudo certbot renew`
   - Verificar configuração: `sudo nginx -t`

Para suporte adicional, consulte os logs específicos de cada serviço.