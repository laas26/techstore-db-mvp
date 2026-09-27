// Define as operações do carrinho, todas protegidas pela sessão do usuário.
const { Router } = require("express");
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", cartController.listar);
router.post("/items", cartController.adicionarOuAtualizar);
router.delete("/items/:id", cartController.remover);

module.exports = router;
