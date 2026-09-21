// Registra a rota pública de criação de contas de clientes.
const router = require("express").Router();
const authController = require("../controllers/authController");
const validarCadastro = require("../middlewares/validarCadastro");

// Rota publica para criar uma conta de cliente.
router.post("/register", validarCadastro, authController.register);

module.exports = router;
