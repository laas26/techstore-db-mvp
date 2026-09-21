// Expõe catálogo público e mutações administrativas protegidas.
const { Router } = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const router = Router();

// Rota que o frontend vai chamar: GET /produtos
router.get("/produtos", productController.listar);
router.post(
	"/produtos",
	authMiddleware,
	adminMiddleware,
	productController.criar,
);
router.patch(
	"/produtos/:id",
	authMiddleware,
	adminMiddleware,
	productController.atualizar,
);
router.put(
	"/produtos/:id",
	authMiddleware,
	adminMiddleware,
	productController.atualizar,
);
router.delete(
	"/produtos/:id",
	authMiddleware,
	adminMiddleware,
	productController.remover,
);

module.exports = router;
