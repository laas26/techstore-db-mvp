const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validarLogin = require('../middlewares/validarLogin');
const rateLimit = require('express-rate-limit');

const configuredLimit = Number(process.env.LOGIN_RATE_LIMIT);
const loginLimit =
  Number.isInteger(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : 5;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: loginLimit,
  skipSuccessfulRequests: true,
  message: {
    erro: 'Muitas tentativas de login. Tente novamente mais tarde.',
  },
});

router.post('/login', loginLimiter, validarLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
