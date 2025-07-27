-- Plataforma de Gestão Terapêutica - Schema MySQL para cPanel
-- Versão: 1.0 - Otimizado para produção
-- Desenvolvido para: NiceBee

SET NAMES utf8mb4;
SET time_zone = '-03:00';
SET FOREIGN_KEY_CHECKS = 0;

--
-- Tabela `usuarios`
-- Armazena todos os usuários do sistema (admins, assistentes, profissionais).
--
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Deve ser armazenado como hash',
  `tipo` ENUM('admin', 'assistente', 'profissional') NOT NULL,
  `especialidade_id` INT UNSIGNED NULL COMMENT 'Apenas para profissionais',
  `telefone` VARCHAR(20) NULL,
  `status` ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  `ultimo_login` DATETIME NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_status` (`status`),
  KEY `fk_usuario_especialidade` (`especialidade_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `tipos_terapia`
-- Armazena as especialidades/categorias de terapia (Psicologia, Fisioterapia, etc).
--
DROP TABLE IF EXISTS `tipos_terapia`;
CREATE TABLE `tipos_terapia` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `pacientes`
-- Cadastro central de todos os pacientes da clínica.
--
DROP TABLE IF EXISTS `pacientes`;
CREATE TABLE `pacientes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome_completo` VARCHAR(255) NOT NULL,
  `data_nascimento` DATE NOT NULL,
  `genero` ENUM('Masculino', 'Feminino', 'Outro', 'Não informado') NOT NULL,
  `categoria` ENUM('Infantil', 'Adolescente', 'Adulto', 'Idoso') NOT NULL,
  `email` VARCHAR(255) NULL,
  `telefone` VARCHAR(20) NULL,
  `endereco` TEXT NULL,
  `status` ENUM('Ativo', 'Inativo', 'Em Avaliação') NOT NULL DEFAULT 'Em Avaliação',
  `profissional_responsavel_id` INT UNSIGNED NULL,
  `plano_medico_id` INT UNSIGNED NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nome` (`nome_completo`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_status` (`status`),
  KEY `fk_paciente_profissional` (`profissional_responsavel_id`),
  KEY `fk_paciente_plano` (`plano_medico_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `agendamentos`
-- Gerencia todos os agendamentos da clínica.
--
DROP TABLE IF EXISTS `agendamentos`;
CREATE TABLE `agendamentos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` INT UNSIGNED NOT NULL,
  `profissional_id` INT UNSIGNED NOT NULL,
  `tipo_terapia_id` INT UNSIGNED NOT NULL,
  `data_hora_inicio` DATETIME NOT NULL,
  `data_hora_fim` DATETIME NOT NULL,
  `frequencia` ENUM('Única', 'Semanal', 'Quinzenal', 'Mensal') NOT NULL DEFAULT 'Única',
  `status` ENUM('Agendado', 'Confirmado', 'Cancelado', 'Concluído', 'Falta') NOT NULL DEFAULT 'Agendado',
  `observacoes` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_data_hora` (`data_hora_inicio`),
  KEY `idx_status` (`status`),
  KEY `fk_agendamento_paciente` (`paciente_id`),
  KEY `fk_agendamento_profissional` (`profissional_id`),
  KEY `fk_agendamento_terapia` (`tipo_terapia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `evolucoes`
-- Registros de evolução de cada sessão.
--
DROP TABLE IF EXISTS `evolucoes`;
CREATE TABLE `evolucoes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `agendamento_id` INT UNSIGNED NOT NULL,
  `paciente_id` INT UNSIGNED NOT NULL,
  `profissional_id` INT UNSIGNED NOT NULL,
  `descricao_sessao` TEXT NOT NULL,
  `objetivos_trabalhados` TEXT NULL,
  `observacoes` TEXT NULL,
  `plano_proxima_sessao` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_evolucao_agendamento` (`agendamento_id`),
  KEY `fk_evolucao_paciente` (`paciente_id`),
  KEY `fk_evolucao_profissional` (`profissional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `prontuario_documentos`
-- Armazena metadados de arquivos do prontuário eletrônico.
--
DROP TABLE IF EXISTS `prontuario_documentos`;
CREATE TABLE `prontuario_documentos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` INT UNSIGNED NOT NULL,
  `profissional_id` INT UNSIGNED NOT NULL COMMENT 'Quem fez o upload',
  `nome_documento` VARCHAR(255) NOT NULL,
  `tipo_documento` ENUM('documento', 'laudo', 'avaliacao', 'outro') NOT NULL,
  `descricao` TEXT NULL,
  `path_arquivo` VARCHAR(255) NOT NULL COMMENT 'Caminho para o arquivo no servidor',
  `tamanho_arquivo` INT NOT NULL COMMENT 'Em bytes',
  `tipo_mime` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tipo_documento` (`tipo_documento`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_documento_paciente` (`paciente_id`),
  KEY `fk_documento_profissional` (`profissional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `relatorios`
-- Armazena relatórios e laudos gerados.
--
DROP TABLE IF EXISTS `relatorios`;
CREATE TABLE `relatorios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` INT UNSIGNED NOT NULL,
  `profissional_id` INT UNSIGNED NOT NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `conteudo` LONGTEXT NOT NULL,
  `status` ENUM('Rascunho', 'Finalizado', 'Enviado') NOT NULL DEFAULT 'Rascunho',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_relatorio_paciente` (`paciente_id`),
  KEY `fk_relatorio_profissional` (`profissional_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `planos_medicos`
-- Cadastro de convênios.
--
DROP TABLE IF EXISTS `planos_medicos`;
CREATE TABLE `planos_medicos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `telefone` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `status` ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nome` (`nome`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `plano_valores_especialidade`
-- Tabela pivot para valores por especialidade de cada plano.
--
DROP TABLE IF EXISTS `plano_valores_especialidade`;
CREATE TABLE `plano_valores_especialidade` (
  `plano_id` INT UNSIGNED NOT NULL,
  `tipo_terapia_id` INT UNSIGNED NOT NULL,
  `valor` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`plano_id`, `tipo_terapia_id`),
  KEY `fk_valor_plano` (`plano_id`),
  KEY `fk_valor_terapia` (`tipo_terapia_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `acompanhantes`
-- Acompanhantes e responsáveis dos pacientes.
--
DROP TABLE IF EXISTS `acompanhantes`;
CREATE TABLE `acompanhantes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` INT UNSIGNED NOT NULL,
  `nome` VARCHAR(255) NOT NULL,
  `parentesco` VARCHAR(100) NOT NULL,
  `telefone` VARCHAR(20) NULL,
  `email` VARCHAR(255) NULL,
  `contato_emergencia` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_acompanhante_paciente` (`paciente_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `comunidade_comentarios`
-- Comentários da comunidade do paciente.
--
DROP TABLE IF EXISTS `comunidade_comentarios`;
CREATE TABLE `comunidade_comentarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `paciente_id` INT UNSIGNED NOT NULL,
  `autor_id` INT UNSIGNED NOT NULL,
  `mensagem` TEXT NOT NULL,
  `categoria` ENUM('Evolução', 'Observação', 'Dúvida', 'Alerta') NOT NULL,
  `urgente` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_comentario_paciente` (`paciente_id`),
  KEY `fk_comentario_autor` (`autor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tabela `configuracoes_pdf`
-- Configurações de layout de PDF por admin.
--
DROP TABLE IF EXISTS `configuracoes_pdf`;
CREATE TABLE `configuracoes_pdf` (
  `admin_id` INT UNSIGNED NOT NULL,
  `logo_url` VARCHAR(255) NULL,
  `nome_clinica` VARCHAR(255) NULL,
  `endereco_clinica` TEXT NULL,
  `rodape_texto` TEXT NULL,
  `cor_cabecalho` VARCHAR(7) NULL DEFAULT '#3B82F6',
  `fonte_familia` VARCHAR(50) NULL DEFAULT 'Arial',
  `campos_visiveis` JSON NULL COMMENT 'Ex: {"descricao": true, "observacoes": true}',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Adicionando Constraints (Chaves Estrangeiras)
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_especialidade` FOREIGN KEY (`especialidade_id`) REFERENCES `tipos_terapia` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_paciente_profissional` FOREIGN KEY (`profissional_responsavel_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_paciente_plano` FOREIGN KEY (`plano_medico_id`) REFERENCES `planos_medicos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `agendamentos`
  ADD CONSTRAINT `fk_agendamento_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_agendamento_profissional` FOREIGN KEY (`profissional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_agendamento_terapia` FOREIGN KEY (`tipo_terapia_id`) REFERENCES `tipos_terapia` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `evolucoes`
  ADD CONSTRAINT `fk_evolucao_agendamento` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_evolucao_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_evolucao_profissional` FOREIGN KEY (`profissional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `prontuario_documentos`
  ADD CONSTRAINT `fk_documento_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_documento_profissional` FOREIGN KEY (`profissional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `relatorios`
  ADD CONSTRAINT `fk_relatorio_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_relatorio_profissional` FOREIGN KEY (`profissional_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `plano_valores_especialidade`
  ADD CONSTRAINT `fk_valor_plano` FOREIGN KEY (`plano_id`) REFERENCES `planos_medicos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_valor_terapia` FOREIGN KEY (`tipo_terapia_id`) REFERENCES `tipos_terapia` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `acompanhantes`
  ADD CONSTRAINT `fk_acompanhante_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comunidade_comentarios`
  ADD CONSTRAINT `fk_comentario_paciente` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comentario_autor` FOREIGN KEY (`autor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `configuracoes_pdf`
  ADD CONSTRAINT `fk_config_admin` FOREIGN KEY (`admin_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

--
-- Dados iniciais
--
INSERT INTO `tipos_terapia` (`nome`, `descricao`) VALUES
('Psicologia', 'Atendimento psicológico individual e em grupo'),
('Fisioterapia', 'Reabilitação física e motora'),
('Terapia Ocupacional', 'Desenvolvimento de habilidades funcionais'),
('Fonoaudiologia', 'Tratamento de distúrbios da comunicação');

INSERT INTO `planos_medicos` (`nome`, `telefone`, `email`, `status`) VALUES
('Particular', '(11) 0000-0000', 'particular@nicebee.com.br', 'Ativo');

-- Usuário administrador padrão
-- Email: admin@clinica.com
-- Senha: admin123 (ALTERE APÓS PRIMEIRO LOGIN!)
INSERT INTO `usuarios` (`nome`, `email`, `password`, `tipo`, `status`) VALUES
('Administrador', 'admin@clinica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ativo');

-- Usuário assistente para testes
-- Email: assistente@clinica.com
-- Senha: assist123
INSERT INTO `usuarios` (`nome`, `email`, `password`, `tipo`, `status`) VALUES
('Assistente Teste', 'assistente@clinica.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'assistente', 'ativo');

-- Usuário profissional para testes
-- Email: psicologo@clinica.com
-- Senha: prof123
INSERT INTO `usuarios` (`nome`, `email`, `password`, `tipo`, `especialidade_id`, `status`) VALUES
('Dr. João Silva', 'psicologo@clinica.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'profissional', 1, 'ativo');