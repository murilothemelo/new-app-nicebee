const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const database = require('../utils/database');
const { validateEmail, validatePassword } = require('../utils/validation');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validações
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Email inválido' });
      }

      // Buscar usuário
      const users = await database.query(
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
      await database.query(
        'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Gerar token
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

      // Remover senha da resposta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async logout(req, res) {
    // Em uma implementação mais robusta, você poderia invalidar o token
    res.json({ message: 'Logout realizado com sucesso' });
  }

  async getCurrentUser(req, res) {
    try {
      const users = await database.query(
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
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({ 
          message: 'Nova senha deve ter pelo menos 8 caracteres, incluindo letras e números' 
        });
      }

      // Buscar usuário atual
      const users = await database.query(
        'SELECT password FROM usuarios WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const user = users[0];
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidCurrentPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      await database.query(
        'UPDATE usuarios SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, req.user.id]
      );

      res.json({ message: 'Senha alterada com sucesso' });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AuthController();