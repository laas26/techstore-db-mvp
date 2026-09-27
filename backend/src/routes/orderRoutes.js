// Define a criação de pedidos e a simulação de pagamento para desenvolvimento.
const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, orderController.criarPedido);
router.post(
	"/:id/simulate-payment",
	authMiddleware,
	orderController.simularPagamento,
);

module.exports = router;
