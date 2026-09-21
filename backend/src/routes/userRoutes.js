// Define endpoints de perfil que exigem uma sessão autenticada.
const router = require("express").Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Rota protegida de perfil
router.get("/perfil", authMiddleware, (req, res) => {
	return res
		.status(200)
		.json({ mensagem: "Acesso permitido!", usuarioId: req.usuarioId });
});

module.exports = router;
