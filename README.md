# 🏥 Plataforma de Gestão Terapêutica - NiceBee

Sistema completo de gestão para clínicas terapêuticas com suporte a múltiplas especialidades (Psicologia, Fisioterapia, Terapia Ocupacional, Fonoaudiologia).

**URL da Aplicação:** `https://app.nicebee.com.br`
**URL da API:** `https://api.nicebee.com.br`

## 🚀 Funcionalidades Principais

(O restante das funcionalidades permanece o mesmo)

...

## 🚀 Instalação e Configuração

### Frontend (`app.nicebee.com.br`)

1.  **Clone o Repositório**
    ```bash
    git clone https://github.com/seu-repositorio/nicebee-frontend.git
    cd nicebee-frontend
    ```

2.  **Instale as Dependências**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto, copiando o `.env.example`. A URL da API já está configurada.
    ```env
    VITE_API_URL=https://api.nicebee.com.br/api/v1
    ```

4.  **Execute o Projeto**
    ```bash
    # Desenvolvimento
    npm run dev

    # Produção
    npm run build
    # Use o resultado da pasta 'dist' para fazer o deploy no seu servidor web.
    ```

### Backend (`api.nicebee.com.br`)

Esta seção é um guia para o desenvolvedor backend.

1.  **Framework**: Recomenda-se um framework PHP moderno como Laravel ou Symfony.

2.  **Banco de Dados**:
    -   Execute o script SQL fornecido em `database_schema.sql` para criar todas as tabelas necessárias no seu banco de dados MySQL.
    -   **IMPORTANTE**: As credenciais do banco de dados (host, nome do banco, usuário, senha) devem ser configuradas no arquivo de ambiente do backend (ex: `.env` no Laravel). **Nunca armazene credenciais no código-fonte.**

    Exemplo de arquivo `.env` para um backend Laravel:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=nicebee_db
    DB_USERNAME=seu_usuario_db
    DB_PASSWORD=sua_senha_db
    ```

3.  **Implementação da API**:
    -   Implemente os endpoints conforme a especificação no arquivo `API_ENDPOINTS.md`.
    -   Configure o CORS (Cross-Origin Resource Sharing) para permitir requisições vindas de `https://app.nicebee.com.br`.

## 🗄️ Estrutura do Banco de Dados

A estrutura completa do banco de dados está definida no arquivo `database_schema.sql`. Ele inclui todas as tabelas, colunas, índices e chaves estrangeiras.

... (Restante do README permanece o mesmo)
