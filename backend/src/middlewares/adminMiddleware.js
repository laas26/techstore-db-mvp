// Restringe operações administrativas a usuários autenticados com role admin.
const userRepository = require("../repositories/userRepository");

async function adminMiddleware(req, res, next) {
	try {
		const usuario = await userRepository.buscarPorId(req.usuarioId);

		if (usuario?.role?.toLowerCase() !== "admin") {
			return res
				.status(403)
				.json({ erro: "Acesso restrito a administradores" });
		}

		req.usuario = usuario;
		return next();
	} catch (error) {
		return next(error);
	}
}

module.exports = adminMiddleware;
