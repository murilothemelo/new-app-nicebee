@@ .. @@
 -- Plataforma de Gestão Terapêutica - Schema MySQL
 -- Versão: 1.0
 -- Desenvolvido para: NiceBee
+-- Otimizado para produção cPanel
 
 SET NAMES utf8mb4;
 SET time_zone = '-03:00';
@@ .. @@
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `email_unique` (`email`),
-  KEY `fk_usuario_especialidade` (`especialidade_id`)
+  KEY `fk_usuario_especialidade` (`especialidade_id`),
+  KEY `idx_tipo` (`tipo`),
+  KEY `idx_status` (`status`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-  PRIMARY KEY (`id`)
+  PRIMARY KEY (`id`),
+  KEY `idx_nome` (`nome`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
+  KEY `idx_nome` (`nome_completo`),
+  KEY `idx_categoria` (`categoria`),
+  KEY `idx_status` (`status`),
   KEY `fk_paciente_profissional` (`profissional_responsavel_id`),
   KEY `fk_paciente_plano` (`plano_medico_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
+  KEY `idx_data_hora` (`data_hora_inicio`),
+  KEY `idx_status` (`status`),
   KEY `fk_agendamento_paciente` (`paciente_id`),
   KEY `fk_agendamento_profissional` (`profissional_id`),
   KEY `fk_agendamento_terapia` (`tipo_terapia_id`)
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
+  KEY `idx_created_at` (`created_at`),
   KEY `fk_evolucao_agendamento` (`agendamento_id`),
   KEY `fk_evolucao_paciente` (`paciente_id`),
   KEY `fk_evolucao_profissional` (`profissional_id`)
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
+  KEY `idx_tipo_documento` (`tipo_documento`),
+  KEY `idx_created_at` (`created_at`),
   KEY `fk_documento_paciente` (`paciente_id`),
   KEY `fk_documento_profissional` (`profissional_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
+  KEY `idx_status` (`status`),
+  KEY `idx_created_at` (`created_at`),
   KEY `fk_relatorio_paciente` (`paciente_id`),
   KEY `fk_relatorio_profissional` (`profissional_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
@@ .. @@
   `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-  PRIMARY KEY (`id`)
+  PRIMARY KEY (`id`),
+  KEY `idx_nome` (`nome`),
+  KEY `idx_status` (`status`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
@@ .. @@
 SET FOREIGN_KEY_CHECKS = 1;
 
+--
+-- Dados iniciais
+--
+
+-- Inserir tipos de terapia padrão
+INSERT INTO `tipos_terapia` (`nome`, `descricao`) VALUES
+('Psicologia', 'Atendimento psicológico individual e em grupo'),
+('Fisioterapia', 'Reabilitação física e motora'),
+('Terapia Ocupacional', 'Desenvolvimento de habilidades funcionais'),
+('Fonoaudiologia', 'Tratamento de distúrbios da comunicação');
+
+-- Inserir plano médico padrão
+INSERT INTO `planos_medicos` (`nome`, `telefone`, `email`, `status`) VALUES
+('Particular', '(11) 0000-0000', 'particular@nicebee.com.br', 'Ativo');
+
+-- Inserir usuário administrador padrão
+-- Senha: admin123 (ALTERE APÓS PRIMEIRO LOGIN!)
+INSERT INTO `usuarios` (`nome`, `email`, `password`, `tipo`, `status`) VALUES
+('Administrador', 'admin@clinica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'ativo');