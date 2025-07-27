# ✅ Checklist de Deploy para Produção - NiceBee

## 🔧 Pré-Deploy

### Configuração do Servidor
- [ ] cPanel com PHP 7.4+ configurado
- [ ] MySQL 5.7+ ou MariaDB 10.2+ disponível
- [ ] Extensões PHP necessárias: PDO, MySQL, JSON, OpenSSL, GD
- [ ] mod_rewrite e mod_headers habilitados no Apache
- [ ] Subdomínios criados e apontando para as pastas corretas:
  - [ ] `api.nicebee.com.br` → `/api`
  - [ ] `app.nicebee.com.br` → `/public`

### Banco de Dados
- [ ] Banco `nicebee_db` criado via cPanel
- [ ] Usuário `nicebee_user` criado com senha forte
- [ ] Usuário adicionado ao banco com ALL PRIVILEGES
- [ ] Schema importado via phpMyAdmin (`database_schema.sql`)
- [ ] Dados iniciais inseridos (tipos de terapia, usuário admin)
- [ ] Conexão testada via phpMyAdmin

## 🚀 Deploy da API

### Upload e Configuração
- [ ] Pasta `/api` criada no servidor
- [ ] Todos os arquivos da API enviados via FTP/File Manager
- [ ] Dependências instaladas (`composer install --no-dev` ou upload manual da pasta vendor)
- [ ] Arquivo `.env` configurado com dados corretos:
  - [ ] Credenciais do banco de dados
  - [ ] JWT_SECRET com 64+ caracteres
  - [ ] FRONTEND_URL correto
  - [ ] ENVIRONMENT=production
- [ ] Permissões configuradas:
  - [ ] `chmod 755 /api`
  - [ ] `chmod 600 /api/.env`
  - [ ] `chmod 755 /api/uploads`
  - [ ] `chmod 644 /api/.htaccess`

### Testes da API
- [ ] Endpoint base responde: `GET https://api.nicebee.com.br`
- [ ] Login funciona: `POST https://api.nicebee.com.br/login`
- [ ] CORS configurado corretamente
- [ ] Headers de segurança presentes
- [ ] Upload de arquivos funciona
- [ ] Logs de erro sendo gerados em `/api/error_log`

## 🌐 Deploy do Frontend

### Build e Upload
- [ ] Build de produção gerado: `npm run build:prod`
- [ ] Pasta `/public` criada no servidor
- [ ] Conteúdo da pasta `dist/` enviado para `/public`
- [ ] Arquivo `.htaccess` do frontend configurado
- [ ] Variável `VITE_API_URL` correta no build

### Testes do Frontend
- [ ] Aplicação carrega: `https://app.nicebee.com.br`
- [ ] Roteamento SPA funciona (refresh em rotas internas)
- [ ] Login funciona e redireciona corretamente
- [ ] Assets (CSS, JS, imagens) carregam corretamente
- [ ] Responsividade funciona em diferentes dispositivos

## 🔒 Segurança

### SSL e HTTPS
- [ ] Certificados SSL instalados para ambos subdomínios
- [ ] Redirecionamento HTTP → HTTPS configurado
- [ ] Certificados válidos e não expirados
- [ ] HSTS headers configurados

### Proteção de Arquivos
- [ ] Arquivo `.env` protegido (não acessível via web)
- [ ] Pasta `uploads/` com .htaccess restritivo
- [ ] Arquivos de configuração protegidos
- [ ] Logs não acessíveis publicamente

### Autenticação e Autorização
- [ ] Senha padrão do admin alterada
- [ ] JWT_SECRET único e seguro
- [ ] Tokens com expiração adequada (24h)
- [ ] Permissões por tipo de usuário funcionando

## 📊 Monitoramento

### Logs e Debugging
- [ ] Logs PHP configurados e funcionando
- [ ] Logs de acesso Apache disponíveis
- [ ] Error reporting desabilitado em produção
- [ ] Sistema de monitoramento de uptime configurado

### Performance
- [ ] Compressão Gzip ativada
- [ ] Cache de browser configurado para assets
- [ ] Otimização de imagens ativa
- [ ] CDN configurado (se aplicável)

### Backup
- [ ] Backup automático do cPanel configurado
- [ ] Backup manual do banco de dados realizado
- [ ] Backup dos arquivos de upload realizado
- [ ] Procedimento de restore testado

## 🧪 Testes Finais

### Funcionalidades Críticas
- [ ] Login/Logout funcionando
- [ ] Cadastro de pacientes
- [ ] Agendamento de consultas
- [ ] Upload de documentos
- [ ] Geração de relatórios
- [ ] Sistema de permissões

### Testes de Integração
- [ ] Frontend ↔ API comunicação
- [ ] Autenticação JWT
- [ ] Upload e download de arquivos
- [ ] Filtros e buscas
- [ ] Paginação

### Testes de Usabilidade
- [ ] Interface responsiva
- [ ] Navegação intuitiva
- [ ] Mensagens de erro claras
- [ ] Loading states adequados
- [ ] Feedback visual para ações

## 📝 Documentação

### Para o Cliente
- [ ] Manual de uso básico
- [ ] Credenciais de acesso fornecidas
- [ ] Informações de contato para suporte
- [ ] Procedimentos de backup explicados

### Para Manutenção
- [ ] Documentação técnica atualizada
- [ ] Credenciais de acesso ao servidor documentadas
- [ ] Procedimentos de atualização documentados
- [ ] Contatos de suporte técnico

## 🚨 Pós-Deploy

### Primeiras 24h
- [ ] Monitorar logs de erro
- [ ] Verificar performance
- [ ] Testar com usuários reais
- [ ] Confirmar recebimento de emails (se aplicável)

### Primeira Semana
- [ ] Backup automático funcionando
- [ ] Monitoramento de uptime ativo
- [ ] Feedback dos usuários coletado
- [ ] Ajustes de performance realizados

### Primeiro Mês
- [ ] Análise de uso e performance
- [ ] Otimizações implementadas
- [ ] Treinamento de usuários realizado
- [ ] Plano de manutenção estabelecido

## 🆘 Plano de Contingência

### Problemas Comuns
- [ ] Procedimento para erro 500 da API
- [ ] Procedimento para problemas de CORS
- [ ] Procedimento para falha de conexão com banco
- [ ] Procedimento para certificado SSL expirado

### Contatos de Emergência
- [ ] Suporte do hosting
- [ ] Desenvolvedor responsável
- [ ] Administrador do sistema
- [ ] Cliente/usuário principal

---

## ✅ Aprovação Final

- [ ] **Cliente aprovou o sistema**
- [ ] **Treinamento dos usuários realizado**
- [ ] **Documentação entregue**
- [ ] **Suporte pós-deploy acordado**
- [ ] **Sistema em produção e funcionando**

**Data do Deploy:** _______________  
**Responsável:** _______________  
**Aprovado por:** _______________

---

**🎉 Parabéns! O sistema NiceBee está em produção!**

Lembre-se de:
- Monitorar regularmente
- Manter backups atualizados
- Aplicar atualizações de segurança
- Coletar feedback dos usuários