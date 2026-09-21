// Declara os endpoints públicos de login, logout e recuperação de senha.
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validarLogin = require('../middlewares/validarLogin'); // Opcional: extraído para um middleware separado
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 5 : 100,
  skipSuccessfulRequests: true,
  message: {
    erro: 'Muitas tentativas de login. Tente novamente mais tarde.',
  },
});

// Rota de Login passando pelo middleware de validação e chamando o controller real
router.post('/login', loginLimiter, validarLogin, authController.login);

// Rota de Logout chamando a função correta do controller
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
