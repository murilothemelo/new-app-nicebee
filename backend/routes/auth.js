const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Aplicar rate limiting nas rotas de autenticação
router.use('/login', authLimiter);

router.post('/login', AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/user', authenticateToken, AuthController.getCurrentUser);
router.put('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;