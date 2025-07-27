const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://app.nicebee.com.br',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware de autorização
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    if (roles.length && !roles.includes(req.user.tipo)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    next();
  };
};

// ROTAS DE AUTENTICAÇÃO

// Login
app.post('/api/v1/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const [users] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND status = "ativo"',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Atualizar último login
    await pool.execute(
      'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        tipo: user.tipo,
        especialidade_id: user.especialidade_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Logout
app.post('/api/v1/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Obter usuário atual
app.get('/api/v1/user', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, nome, email, tipo, especialidade_id, telefone, status FROM usuarios WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE PACIENTES

// Listar pacientes
app.get('/api/v1/pacientes', authenticateToken, async (req, res) => {
  try {
    const { categoria, status, profissional_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.nome as profissional_nome, pm.nome as plano_nome
      FROM pacientes p
      LEFT JOIN usuarios u ON p.profissional_responsavel_id = u.id
      LEFT JOIN planos_medicos pm ON p.plano_medico_id = pm.id
      WHERE 1=1
    `;
    const params = [];

    // Filtros
    if (categoria) {
      query += ' AND p.categoria = ?';
      params.push(categoria);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (profissional_id) {
      query += ' AND p.profissional_responsavel_id = ?';
      params.push(profissional_id);
    }

    // Se for profissional, só pode ver seus próprios pacientes
    if (req.user.tipo === 'profissional') {
      query += ' AND p.profissional_responsavel_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [pacientes] = await pool.execute(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM pacientes p WHERE 1=1';
    const countParams = [];

    if (categoria) {
      countQuery += ' AND p.categoria = ?';
      countParams.push(categoria);
    }

    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }

    if (profissional_id) {
      countQuery += ' AND p.profissional_responsavel_id = ?';
      countParams.push(profissional_id);
    }

    if (req.user.tipo === 'profissional') {
      countQuery += ' AND p.profissional_responsavel_id = ?';
      countParams.push(req.user.id);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      data: pacientes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Obter paciente específico
app.get('/api/v1/pacientes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT p.*, u.nome as profissional_nome, pm.nome as plano_nome
      FROM pacientes p
      LEFT JOIN usuarios u ON p.profissional_responsavel_id = u.id
      LEFT JOIN planos_medicos pm ON p.plano_medico_id = pm.id
      WHERE p.id = ?
    `;
    const params = [id];

    // Se for profissional, só pode ver seus próprios pacientes
    if (req.user.tipo === 'profissional') {
      query += ' AND p.profissional_responsavel_id = ?';
      params.push(req.user.id);
    }

    const [pacientes] = await pool.execute(query, params);

    if (pacientes.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    res.json(pacientes[0]);

  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar paciente
app.post('/api/v1/pacientes', authenticateToken, authorize(['admin', 'assistente']), async (req, res) => {
  try {
    const {
      nome_completo,
      data_nascimento,
      genero,
      categoria,
      email,
      telefone,
      endereco,
      profissional_responsavel_id,
      plano_medico_id
    } = req.body;

    if (!nome_completo || !data_nascimento || !genero || !categoria) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO pacientes (
        nome_completo, data_nascimento, genero, categoria, email, telefone, 
        endereco, profissional_responsavel_id, plano_medico_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome_completo, data_nascimento, genero, categoria, email, telefone,
        endereco, profissional_responsavel_id, plano_medico_id
      ]
    );

    const [novoPaciente] = await pool.execute(
      'SELECT * FROM pacientes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(novoPaciente[0]);

  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar paciente
app.put('/api/v1/pacientes/:id', authenticateToken, authorize(['admin', 'assistente']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      data_nascimento,
      genero,
      categoria,
      email,
      telefone,
      endereco,
      status,
      profissional_responsavel_id,
      plano_medico_id
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE pacientes SET 
        nome_completo = ?, data_nascimento = ?, genero = ?, categoria = ?,
        email = ?, telefone = ?, endereco = ?, status = ?,
        profissional_responsavel_id = ?, plano_medico_id = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        nome_completo, data_nascimento, genero, categoria, email, telefone,
        endereco, status, profissional_responsavel_id, plano_medico_id, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    const [pacienteAtualizado] = await pool.execute(
      'SELECT * FROM pacientes WHERE id = ?',
      [id]
    );

    res.json(pacienteAtualizado[0]);

  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar paciente
app.delete('/api/v1/pacientes/:id', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM pacientes WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    res.json({ message: 'Paciente deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE AGENDAMENTOS

// Listar agendamentos
app.get('/api/v1/agendamentos', authenticateToken, async (req, res) => {
  try {
    const { data_inicio, data_fim, profissional_id, paciente_id, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, p.nome_completo as paciente_nome, u.nome as profissional_nome, 
             tt.nome as tipo_terapia_nome
      FROM agendamentos a
      JOIN pacientes p ON a.paciente_id = p.id
      JOIN usuarios u ON a.profissional_id = u.id
      JOIN tipos_terapia tt ON a.tipo_terapia_id = tt.id
      WHERE 1=1
    `;
    const params = [];

    // Filtros
    if (data_inicio) {
      query += ' AND DATE(a.data_hora_inicio) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(a.data_hora_inicio) <= ?';
      params.push(data_fim);
    }

    if (profissional_id) {
      query += ' AND a.profissional_id = ?';
      params.push(profissional_id);
    }

    if (paciente_id) {
      query += ' AND a.paciente_id = ?';
      params.push(paciente_id);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // Se for profissional, só pode ver seus próprios agendamentos
    if (req.user.tipo === 'profissional') {
      query += ' AND a.profissional_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY a.data_hora_inicio ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [agendamentos] = await pool.execute(query, params);

    res.json({ data: agendamentos });

  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar agendamento
app.post('/api/v1/agendamentos', authenticateToken, async (req, res) => {
  try {
    const {
      paciente_id,
      profissional_id,
      tipo_terapia_id,
      data_hora_inicio,
      data_hora_fim,
      frequencia = 'Única',
      observacoes
    } = req.body;

    if (!paciente_id || !profissional_id || !tipo_terapia_id || !data_hora_inicio || !data_hora_fim) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar conflitos de horário
    const [conflitos] = await pool.execute(
      `SELECT id FROM agendamentos 
       WHERE profissional_id = ? 
       AND status NOT IN ('Cancelado', 'Concluído')
       AND (
         (data_hora_inicio <= ? AND data_hora_fim > ?) OR
         (data_hora_inicio < ? AND data_hora_fim >= ?) OR
         (data_hora_inicio >= ? AND data_hora_fim <= ?)
       )`,
      [profissional_id, data_hora_inicio, data_hora_inicio, data_hora_fim, data_hora_fim, data_hora_inicio, data_hora_fim]
    );

    if (conflitos.length > 0) {
      return res.status(400).json({ message: 'Conflito de horário detectado' });
    }

    const [result] = await pool.execute(
      `INSERT INTO agendamentos (
        paciente_id, profissional_id, tipo_terapia_id, data_hora_inicio, 
        data_hora_fim, frequencia, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paciente_id, profissional_id, tipo_terapia_id, data_hora_inicio, data_hora_fim, frequencia, observacoes]
    );

    const [novoAgendamento] = await pool.execute(
      `SELECT a.*, p.nome_completo as paciente_nome, u.nome as profissional_nome, 
              tt.nome as tipo_terapia_nome
       FROM agendamentos a
       JOIN pacientes p ON a.paciente_id = p.id
       JOIN usuarios u ON a.profissional_id = u.id
       JOIN tipos_terapia tt ON a.tipo_terapia_id = tt.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoAgendamento[0]);

  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar agendamento
app.put('/api/v1/agendamentos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      data_hora_inicio,
      data_hora_fim,
      status,
      observacoes
    } = req.body;

    let query = 'UPDATE agendamentos SET updated_at = NOW()';
    const params = [];

    if (data_hora_inicio) {
      query += ', data_hora_inicio = ?';
      params.push(data_hora_inicio);
    }

    if (data_hora_fim) {
      query += ', data_hora_fim = ?';
      params.push(data_hora_fim);
    }

    if (status) {
      query += ', status = ?';
      params.push(status);
    }

    if (observacoes !== undefined) {
      query += ', observacoes = ?';
      params.push(observacoes);
    }

    query += ' WHERE id = ?';
    params.push(id);

    // Se for profissional, só pode atualizar seus próprios agendamentos
    if (req.user.tipo === 'profissional') {
      query += ' AND profissional_id = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    const [agendamentoAtualizado] = await pool.execute(
      `SELECT a.*, p.nome_completo as paciente_nome, u.nome as profissional_nome, 
              tt.nome as tipo_terapia_nome
       FROM agendamentos a
       JOIN pacientes p ON a.paciente_id = p.id
       JOIN usuarios u ON a.profissional_id = u.id
       JOIN tipos_terapia tt ON a.tipo_terapia_id = tt.id
       WHERE a.id = ?`,
      [id]
    );

    res.json(agendamentoAtualizado[0]);

  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Deletar agendamento
app.delete('/api/v1/agendamentos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = 'DELETE FROM agendamentos WHERE id = ?';
    const params = [id];

    // Se for profissional, só pode deletar seus próprios agendamentos
    if (req.user.tipo === 'profissional') {
      query += ' AND profissional_id = ?';
      params.push(req.user.id);
    }

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar agendamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE EVOLUÇÕES

// Listar evoluções
app.get('/api/v1/evolucoes', authenticateToken, async (req, res) => {
  try {
    const { paciente_id, profissional_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT e.*, p.nome_completo as paciente_nome, u.nome as profissional_nome,
             a.data_hora_inicio as data_sessao
      FROM evolucoes e
      JOIN pacientes p ON e.paciente_id = p.id
      JOIN usuarios u ON e.profissional_id = u.id
      JOIN agendamentos a ON e.agendamento_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (paciente_id) {
      query += ' AND e.paciente_id = ?';
      params.push(paciente_id);
    }

    if (profissional_id) {
      query += ' AND e.profissional_id = ?';
      params.push(profissional_id);
    }

    // Se for profissional, só pode ver suas próprias evoluções
    if (req.user.tipo === 'profissional') {
      query += ' AND e.profissional_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [evolucoes] = await pool.execute(query, params);

    res.json({ data: evolucoes });

  } catch (error) {
    console.error('Erro ao listar evoluções:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar evolução
app.post('/api/v1/evolucoes', authenticateToken, async (req, res) => {
  try {
    const {
      agendamento_id,
      paciente_id,
      descricao_sessao,
      objetivos_trabalhados,
      observacoes,
      plano_proxima_sessao
    } = req.body;

    if (!agendamento_id || !paciente_id || !descricao_sessao) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO evolucoes (
        agendamento_id, paciente_id, profissional_id, descricao_sessao,
        objetivos_trabalhados, observacoes, plano_proxima_sessao
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [agendamento_id, paciente_id, req.user.id, descricao_sessao, objetivos_trabalhados, observacoes, plano_proxima_sessao]
    );

    const [novaEvolucao] = await pool.execute(
      `SELECT e.*, p.nome_completo as paciente_nome, u.nome as profissional_nome
       FROM evolucoes e
       JOIN pacientes p ON e.paciente_id = p.id
       JOIN usuarios u ON e.profissional_id = u.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novaEvolucao[0]);

  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE DOCUMENTOS DO PRONTUÁRIO

// Listar documentos de um paciente
app.get('/api/v1/pacientes/:pacienteId/documentos', authenticateToken, async (req, res) => {
  try {
    const { pacienteId } = req.params;

    let query = `
      SELECT pd.*, u.nome as profissional_nome
      FROM prontuario_documentos pd
      JOIN usuarios u ON pd.profissional_id = u.id
      WHERE pd.paciente_id = ?
    `;
    const params = [pacienteId];

    // Se for profissional, verificar se tem acesso ao paciente
    if (req.user.tipo === 'profissional') {
      const [paciente] = await pool.execute(
        'SELECT profissional_responsavel_id FROM pacientes WHERE id = ?',
        [pacienteId]
      );

      if (paciente.length === 0 || paciente[0].profissional_responsavel_id !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado a este paciente' });
      }
    }

    query += ' ORDER BY pd.created_at DESC';

    const [documentos] = await pool.execute(query, params);

    res.json({ data: documentos });

  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Upload de documento
app.post('/api/v1/pacientes/:pacienteId/documentos', authenticateToken, upload.single('arquivo'), async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const { nome_documento, tipo_documento, descricao } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo é obrigatório' });
    }

    if (!nome_documento || !tipo_documento) {
      return res.status(400).json({ message: 'Nome e tipo do documento são obrigatórios' });
    }

    const [result] = await pool.execute(
      `INSERT INTO prontuario_documentos (
        paciente_id, profissional_id, nome_documento, tipo_documento,
        descricao, path_arquivo, tamanho_arquivo, tipo_mime
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pacienteId, req.user.id, nome_documento, tipo_documento,
        descricao, req.file.path, req.file.size, req.file.mimetype
      ]
    );

    const [novoDocumento] = await pool.execute(
      `SELECT pd.*, u.nome as profissional_nome
       FROM prontuario_documentos pd
       JOIN usuarios u ON pd.profissional_id = u.id
       WHERE pd.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoDocumento[0]);

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Download de documento
app.get('/api/v1/documentos/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [documentos] = await pool.execute(
      'SELECT * FROM prontuario_documentos WHERE id = ?',
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const documento = documentos[0];

    // Verificar permissão se for profissional
    if (req.user.tipo === 'profissional') {
      const [paciente] = await pool.execute(
        'SELECT profissional_responsavel_id FROM pacientes WHERE id = ?',
        [documento.paciente_id]
      );

      if (paciente.length === 0 || paciente[0].profissional_responsavel_id !== req.user.id) {
        return res.status(403).json({ message: 'Acesso negado' });
      }
    }

    res.download(documento.path_arquivo, documento.nome_documento);

  } catch (error) {
    console.error('Erro ao fazer download:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE USUÁRIOS (Admin apenas)

// Listar usuários
app.get('/api/v1/usuarios', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT u.id, u.nome, u.email, u.tipo, u.telefone, u.status, u.ultimo_login,
              u.created_at, tt.nome as especialidade_nome
       FROM usuarios u
       LEFT JOIN tipos_terapia tt ON u.especialidade_id = tt.id
       ORDER BY u.created_at DESC`
    );

    res.json({ data: usuarios });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar usuário
app.post('/api/v1/usuarios', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { nome, email, password, tipo, especialidade_id, telefone } = req.body;

    if (!nome || !email || !password || !tipo) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    // Verificar se email já existe
    const [existingUser] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO usuarios (nome, email, password, tipo, especialidade_id, telefone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, email, hashedPassword, tipo, especialidade_id, telefone]
    );

    const [novoUsuario] = await pool.execute(
      `SELECT u.id, u.nome, u.email, u.tipo, u.telefone, u.status, u.created_at,
              tt.nome as especialidade_nome
       FROM usuarios u
       LEFT JOIN tipos_terapia tt ON u.especialidade_id = tt.id
       WHERE u.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoUsuario[0]);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE TIPOS DE TERAPIA

// Listar tipos de terapia
app.get('/api/v1/tipos-terapia', authenticateToken, async (req, res) => {
  try {
    const [tipos] = await pool.execute(
      'SELECT * FROM tipos_terapia ORDER BY nome'
    );

    res.json({ data: tipos });

  } catch (error) {
    console.error('Erro ao listar tipos de terapia:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE PLANOS MÉDICOS

// Listar planos médicos
app.get('/api/v1/planos-medicos', authenticateToken, async (req, res) => {
  try {
    const [planos] = await pool.execute(
      'SELECT * FROM planos_medicos ORDER BY nome'
    );

    res.json({ data: planos });

  } catch (error) {
    console.error('Erro ao listar planos médicos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE RELATÓRIOS

// Listar relatórios
app.get('/api/v1/relatorios', authenticateToken, async (req, res) => {
  try {
    const { paciente_id, profissional_id, status } = req.query;

    let query = `
      SELECT r.*, p.nome_completo as paciente_nome, u.nome as profissional_nome
      FROM relatorios r
      JOIN pacientes p ON r.paciente_id = p.id
      JOIN usuarios u ON r.profissional_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (paciente_id) {
      query += ' AND r.paciente_id = ?';
      params.push(paciente_id);
    }

    if (profissional_id) {
      query += ' AND r.profissional_id = ?';
      params.push(profissional_id);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    // Se for profissional, só pode ver seus próprios relatórios
    if (req.user.tipo === 'profissional') {
      query += ' AND r.profissional_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY r.created_at DESC';

    const [relatorios] = await pool.execute(query, params);

    res.json({ data: relatorios });

  } catch (error) {
    console.error('Erro ao listar relatórios:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar relatório
app.post('/api/v1/relatorios', authenticateToken, async (req, res) => {
  try {
    const { paciente_id, titulo, conteudo, status = 'Rascunho' } = req.body;

    if (!paciente_id || !titulo || !conteudo) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO relatorios (paciente_id, profissional_id, titulo, conteudo, status)
       VALUES (?, ?, ?, ?, ?)`,
      [paciente_id, req.user.id, titulo, conteudo, status]
    );

    const [novoRelatorio] = await pool.execute(
      `SELECT r.*, p.nome_completo as paciente_nome, u.nome as profissional_nome
       FROM relatorios r
       JOIN pacientes p ON r.paciente_id = p.id
       JOIN usuarios u ON r.profissional_id = u.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoRelatorio[0]);

  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE COMUNIDADE

// Listar comentários da comunidade
app.get('/api/v1/comunidade', authenticateToken, async (req, res) => {
  try {
    const { paciente_id } = req.query;

    let query = `
      SELECT cc.*, p.nome_completo as paciente_nome, u.nome as autor_nome
      FROM comunidade_comentarios cc
      JOIN pacientes p ON cc.paciente_id = p.id
      JOIN usuarios u ON cc.autor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (paciente_id) {
      query += ' AND cc.paciente_id = ?';
      params.push(paciente_id);
    }

    // Se for profissional, só pode ver comentários de seus pacientes
    if (req.user.tipo === 'profissional') {
      query += ` AND cc.paciente_id IN (
        SELECT id FROM pacientes WHERE profissional_responsavel_id = ?
      )`;
      params.push(req.user.id);
    }

    query += ' ORDER BY cc.created_at DESC';

    const [comentarios] = await pool.execute(query, params);

    res.json({ data: comentarios });

  } catch (error) {
    console.error('Erro ao listar comentários:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar comentário na comunidade
app.post('/api/v1/comunidade', authenticateToken, async (req, res) => {
  try {
    const { paciente_id, mensagem, categoria, urgente = false } = req.body;

    if (!paciente_id || !mensagem || !categoria) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO comunidade_comentarios (paciente_id, autor_id, mensagem, categoria, urgente)
       VALUES (?, ?, ?, ?, ?)`,
      [paciente_id, req.user.id, mensagem, categoria, urgente]
    );

    const [novoComentario] = await pool.execute(
      `SELECT cc.*, p.nome_completo as paciente_nome, u.nome as autor_nome
       FROM comunidade_comentarios cc
       JOIN pacientes p ON cc.paciente_id = p.id
       JOIN usuarios u ON cc.autor_id = u.id
       WHERE cc.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoComentario[0]);

  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE ACOMPANHANTES

// Listar acompanhantes
app.get('/api/v1/acompanhantes', authenticateToken, async (req, res) => {
  try {
    const { paciente_id } = req.query;

    let query = `
      SELECT a.*, p.nome_completo as paciente_nome
      FROM acompanhantes a
      JOIN pacientes p ON a.paciente_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (paciente_id) {
      query += ' AND a.paciente_id = ?';
      params.push(paciente_id);
    }

    // Se for profissional, só pode ver acompanhantes de seus pacientes
    if (req.user.tipo === 'profissional') {
      query += ` AND a.paciente_id IN (
        SELECT id FROM pacientes WHERE profissional_responsavel_id = ?
      )`;
      params.push(req.user.id);
    }

    query += ' ORDER BY a.nome';

    const [acompanhantes] = await pool.execute(query, params);

    res.json({ data: acompanhantes });

  } catch (error) {
    console.error('Erro ao listar acompanhantes:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Criar acompanhante
app.post('/api/v1/acompanhantes', authenticateToken, async (req, res) => {
  try {
    const { paciente_id, nome, parentesco, telefone, email, contato_emergencia = false } = req.body;

    if (!paciente_id || !nome || !parentesco) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos' });
    }

    const [result] = await pool.execute(
      `INSERT INTO acompanhantes (paciente_id, nome, parentesco, telefone, email, contato_emergencia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [paciente_id, nome, parentesco, telefone, email, contato_emergencia]
    );

    const [novoAcompanhante] = await pool.execute(
      `SELECT a.*, p.nome_completo as paciente_nome
       FROM acompanhantes a
       JOIN pacientes p ON a.paciente_id = p.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json(novoAcompanhante[0]);

  } catch (error) {
    console.error('Erro ao criar acompanhante:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// ROTAS DE CONFIGURAÇÕES PDF (Admin apenas)

// Obter configurações PDF
app.get('/api/v1/configuracoes-pdf', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const [configs] = await pool.execute(
      'SELECT * FROM configuracoes_pdf WHERE admin_id = ?',
      [req.user.id]
    );

    if (configs.length === 0) {
      // Retornar configurações padrão
      return res.json({
        admin_id: req.user.id,
        nome_clinica: 'Clínica Terapêutica',
        endereco_clinica: '',
        rodape_texto: '',
        cor_cabecalho: '#3B82F6',
        fonte_familia: 'Arial',
        campos_visiveis: {
          descricao: true,
          observacoes: true,
          profissional: true,
          data: true,
          assinatura: true
        }
      });
    }

    const config = configs[0];
    if (config.campos_visiveis) {
      config.campos_visiveis = JSON.parse(config.campos_visiveis);
    }

    res.json(config);

  } catch (error) {
    console.error('Erro ao obter configurações PDF:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Atualizar configurações PDF
app.put('/api/v1/configuracoes-pdf', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const {
      nome_clinica,
      endereco_clinica,
      rodape_texto,
      cor_cabecalho,
      fonte_familia,
      campos_visiveis
    } = req.body;

    const camposVisiveisJson = JSON.stringify(campos_visiveis);

    const [existing] = await pool.execute(
      'SELECT admin_id FROM configuracoes_pdf WHERE admin_id = ?',
      [req.user.id]
    );

    if (existing.length === 0) {
      // Criar nova configuração
      await pool.execute(
        `INSERT INTO configuracoes_pdf (
          admin_id, nome_clinica, endereco_clinica, rodape_texto,
          cor_cabecalho, fonte_familia, campos_visiveis
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, nome_clinica, endereco_clinica, rodape_texto, cor_cabecalho, fonte_familia, camposVisiveisJson]
      );
    } else {
      // Atualizar configuração existente
      await pool.execute(
        `UPDATE configuracoes_pdf SET
          nome_clinica = ?, endereco_clinica = ?, rodape_texto = ?,
          cor_cabecalho = ?, fonte_familia = ?, campos_visiveis = ?,
          updated_at = NOW()
        WHERE admin_id = ?`,
        [nome_clinica, endereco_clinica, rodape_texto, cor_cabecalho, fonte_familia, camposVisiveisJson, req.user.id]
      );
    }

    const [updatedConfig] = await pool.execute(
      'SELECT * FROM configuracoes_pdf WHERE admin_id = ?',
      [req.user.id]
    );

    const config = updatedConfig[0];
    if (config.campos_visiveis) {
      config.campos_visiveis = JSON.parse(config.campos_visiveis);
    }

    res.json(config);

  } catch (error) {
    console.error('Erro ao atualizar configurações PDF:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;