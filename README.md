# 🏥 Plataforma de Gestão Terapêutica - NiceBee

Sistema completo de gestão para clínicas terapêuticas com suporte a múltiplas especialidades (Psicologia, Fisioterapia, Terapia Ocupacional, Fonoaudiologia).

**🌐 URLs de Produção:**
- **Frontend:** `https://app.nicebee.com.br`
- **API:** `https://api.nicebee.com.br`

**🔑 Acesso Padrão:**
- **Email:** admin@clinica.com
- **Senha:** admin123 (ALTERE após primeiro login!)

## 🚀 Funcionalidades Principais

### 👥 Gestão de Usuários
- Sistema de autenticação JWT
- Três níveis de acesso: Admin, Assistente, Profissional
- Controle de permissões por funcionalidade

### 🏥 Gestão de Pacientes
- Cadastro completo com categorização (Infantil, Adolescente, Adulto, Idoso)
- Histórico médico e evolução
- Vinculação com profissionais responsáveis
- Integração com planos médicos

### 📅 Sistema de Agendamentos
- Agenda visual por semana/dia
- Controle de conflitos de horário
- Status de agendamentos (Agendado, Confirmado, Cancelado, Concluído)
- Frequência de sessões (Única, Semanal, Quinzenal, Mensal)

### 📋 Evoluções e Relatórios
- Registro detalhado de sessões
- Geração de relatórios personalizáveis
- Configuração de layout PDF (Admin)
- Histórico completo por paciente

### 📁 Prontuário Eletrônico
- Upload seguro de documentos
- Categorização por tipo (Documento, Laudo, Avaliação)
- Controle de acesso por profissional
- Download e visualização de arquivos

### 💬 Comunidade do Paciente
- Sistema de comentários entre profissionais
- Categorização por urgência
- Histórico de discussões por paciente

### ⚙️ Configurações Avançadas
- Gestão de tipos de terapia
- Cadastro de planos médicos com valores
- Acompanhantes e contatos de emergência
- Configurações de PDF personalizáveis

## 🚀 Instalação e Configuração

### 🖥️ Desenvolvimento Local

#### Frontend
```bash
# Clone o repositório
git clone https://github.com/seu-repositorio/nicebee-frontend.git
cd nicebee-frontend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Execute em modo desenvolvimento
npm run dev
```

#### API Local (para testes)
```bash
cd api
composer install

# Configure .env
cp .env.example .env

# Inicie servidor PHP local
php -S localhost:8000
```

### 🌐 Deploy para Produção (cPanel)

#### Pré-requisitos
- Hosting com cPanel
- PHP 7.4+ com extensões: PDO, MySQL, JSON, OpenSSL
- MySQL 5.7+ ou MariaDB 10.2+
- Subdomínios configurados:
  - `api.nicebee.com.br` → `/api`
  - `app.nicebee.com.br` → `/public`

#### 1. Configuração do Banco de Dados
1. **Criar banco via cPanel:**
   - Acesse "MySQL Databases"
   - Crie banco: `nicebee_db`
   - Crie usuário: `nicebee_user`
   - Adicione usuário ao banco com ALL PRIVILEGES

2. **Importar schema:**
   - Acesse phpMyAdmin
   - Importe o arquivo `database_schema.sql`

#### 2. Deploy da API
1. **Upload dos arquivos:**
   - Faça upload da pasta `api/` para `/api` no servidor
   - Instale dependências: `composer install --no-dev`

2. **Configurar .env:**
   ```env
   DB_HOST=localhost
   DB_NAME=seuusuario_nicebee_db
   DB_USER=seuusuario_nicebee_user
   DB_PASS=sua_senha_do_banco
   
   JWT_SECRET=sua_chave_jwt_super_secreta_de_64_caracteres
   FRONTEND_URL=https://app.nicebee.com.br
   ENVIRONMENT=production
   ```

3. **Configurar permissões:**
   ```bash
   chmod 755 /api
   chmod 600 /api/.env
   chmod 755 /api/uploads
   ```

#### 3. Deploy do Frontend
1. **Build do projeto:**
   ```bash
   npm run build:prod
   ```

2. **Upload:**
   - Faça upload do conteúdo da pasta `dist/` para `/public`

#### 4. Configurar SSL
- Ative Let's Encrypt para ambos subdomínios no cPanel
- Force redirecionamento HTTPS

### 🔧 Configurações Avançadas

#### Segurança
- Tokens JWT com expiração de 24h
- Headers de segurança configurados
- Proteção CORS restritiva
- Upload de arquivos com validação de tipo
- Rate limiting nas rotas de autenticação

#### Performance
- Compressão Gzip ativada
- Cache de assets estáticos
- Otimização de queries com índices
- Lazy loading de componentes React

#### Monitoramento
- Logs de erro PHP
- Logs de acesso Apache
- Backup automático configurável
- Monitoramento de uptime recomendado

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **usuarios**: Gestão de usuários e autenticação
- **pacientes**: Cadastro de pacientes
- **agendamentos**: Sistema de agendas
- **evolucoes**: Registros de sessões
- **prontuario_documentos**: Arquivos do prontuário
- **relatorios**: Relatórios gerados
- **tipos_terapia**: Modalidades terapêuticas
- **planos_medicos**: Convênios e planos
- **acompanhantes**: Responsáveis e contatos
- **comunidade_comentarios**: Sistema de discussões

### Relacionamentos
- Usuários podem ser Admin, Assistente ou Profissional
- Pacientes são vinculados a profissionais responsáveis
- Agendamentos conectam pacientes, profissionais e tipos de terapia
- Evoluções são registradas por agendamento
- Documentos são organizados por paciente

## 🔐 Sistema de Permissões

### Administrador
- Acesso total ao sistema
- Gestão de usuários
- Configurações globais
- Relatórios gerenciais

### Assistente
- Gestão de pacientes
- Agendamentos
- Visualização de relatórios
- Suporte administrativo

### Profissional
- Acesso apenas aos próprios pacientes
- Registro de evoluções
- Geração de relatórios
- Upload de documentos

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas
- **Framer Motion** - Animações

### Backend
- **PHP 7.4+** - Linguagem principal
- **MySQL/MariaDB** - Banco de dados
- **JWT** - Autenticação
- **PDO** - Acesso ao banco
- **Composer** - Gerenciador de dependências

### Infraestrutura
- **cPanel** - Painel de controle
- **Apache** - Servidor web
- **Let's Encrypt** - Certificados SSL
- **phpMyAdmin** - Administração do banco

## 📝 API Endpoints

### Autenticação
- `POST /login` - Login do usuário
- `POST /logout` - Logout
- `GET /user` - Dados do usuário atual

### Pacientes
- `GET /pacientes` - Listar pacientes
- `GET /pacientes/{id}` - Obter paciente
- `POST /pacientes` - Criar paciente
- `PUT /pacientes/{id}` - Atualizar paciente
- `DELETE /pacientes/{id}` - Deletar paciente

### Agendamentos
- `GET /agendamentos` - Listar agendamentos
- `POST /agendamentos` - Criar agendamento
- `PUT /agendamentos/{id}` - Atualizar agendamento
- `DELETE /agendamentos/{id}` - Deletar agendamento

### Evoluções
- `GET /evolucoes` - Listar evoluções
- `POST /evolucoes` - Criar evolução
- `PUT /evolucoes/{id}` - Atualizar evolução

### Prontuário
- `GET /pacientes/{id}/documentos` - Listar documentos
- `POST /pacientes/{id}/documentos` - Upload documento
- `GET /documentos/{id}/download` - Download documento
- `DELETE /documentos/{id}` - Deletar documento

## 🔄 Processo de Atualização

### API
1. Fazer backup da pasta `/api`
2. Upload dos novos arquivos (manter `.env` e `uploads/`)
3. Executar `composer install --no-dev` se necessário
4. Testar endpoints críticos

### Frontend
1. Executar `npm run build:prod` localmente
2. Fazer backup da pasta `/public`
3. Upload do novo build (manter `.htaccess`)
4. Testar funcionalidades principais

## 🆘 Troubleshooting

### Problemas Comuns

**Erro 500 na API:**
- Verificar logs PHP em `/api/error_log`
- Verificar permissões de arquivos
- Verificar configuração `.htaccess`

**CORS Error:**
- Verificar `FRONTEND_URL` no `.env`
- Verificar se `mod_headers` está ativo
- Verificar configuração de CORS

**Banco não conecta:**
- Verificar credenciais no `.env`
- Verificar prefixo do usuário no nome do banco
- Verificar se usuário tem permissões

**Frontend não carrega:**
- Verificar `.htaccess` do frontend
- Verificar se `mod_rewrite` está ativo
- Verificar paths dos assets

### Comandos Úteis

```bash
# Verificar logs
tail -f /api/error_log

# Testar conexão banco
php -r "new PDO('mysql:host=localhost;dbname=nome_banco', 'usuario', 'senha');"

# Verificar permissões
ls -la /api/

# Testar API
curl -X POST https://api.nicebee.com.br/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinica.com","password":"admin123"}'
```

## 📞 Suporte e Contribuição

### Reportar Problemas
1. Verificar logs de erro
2. Reproduzir o problema
3. Documentar passos para reprodução
4. Incluir informações do ambiente

### Desenvolvimento
1. Fork do repositório
2. Criar branch para feature/bugfix
3. Seguir padrões de código
4. Testar alterações
5. Criar pull request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**⚠️ Importante:** 
- Altere a senha padrão após primeiro login
- Configure backup automático
- Monitore logs regularmente
- Mantenha o sistema atualizado

**🔒 Segurança:**
- Use senhas fortes
- Configure SSL corretamente
- Mantenha PHP atualizado
- Monitore tentativas de acesso

Para mais informações, consulte a documentação completa em `/deploy.md`.